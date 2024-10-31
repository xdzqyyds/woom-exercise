
//useSyncExternalStore：一个 React Hook，用于在外部数据源发生变化时同步更新 React 组件的状态
import { useSyncExternalStore } from 'react'
import { event, Context, Data } from './whxp'
import { Stream, StreamState } from '../../lib/api'
//whip-whep/whip 模块中的 WHIPClient 类，用于实现 WHIP 协议的流发布
import { WHIPClient } from 'whip-whep/whip'
import {
  deviceNone,
  deviceScreen,
  asyncGetAudioStream,
  asyncGetVideoStream,
} from '../../lib/device'

//WHIPData 接口继承并扩展了 Data接口，用于描述 WHIPContext 类的实例所具备的属性和方法，而没有赋予属性的具体值和方法的具体功能
interface WHIPData extends Data {
  setUserName: (name: string) => void,//设置用户名，没有返回值
  //接受一个回调函数 callback，该回调函数会接收一个 userStatus 对象（类型为 Stream）
  //当userStatus发生变化时用于同步更新 React 组件的状态
  setSyncUserStatus: (callback: (userStatus: Stream) => void) => void,

  //属性：用于存储音频设备ID和视频设备ID
  currentDeviceAudio: string,
  currentDeviceVideo: string,

  setCurrentDeviceAudio: (current: string) => Promise<void>,//设置当前的音频设备，参数 current 是设备 ID
  setCurrentDeviceVideo: (current: string) => Promise<void>,//设置当前的视频设备
  toggleEnableAudio: () => Promise<void>,//用于在启用和禁用音频之间切换
  toggleEnableVideo: () => Promise<void>,//用于在启用和禁用视频之间切换
}

//WHIPContext 类继承了 Context 类，音视频设备的选择、WebRTC 连接的管理、用户状态的同步以及 WHIP 协议的流发布
class WHIPContext extends Context {
  client: WHIPClient = new WHIPClient()//client：一个 WHIPClient 实例，用于发布 WebRTC 媒体流
  cache: WHIPData//ache 是一个对象，它保存了当前 WHIPContext 实例的状态信息和功能方法，以便在需要时可以对状态进行访问、管理或导出

  currentDeviceAudio = deviceNone.deviceId
  currentDeviceVideo = deviceNone.deviceId
  //this 是指向WHIPContext 类的对象的引用，用于访问和操作该对象的属性和方法
  toggleEnableAudio = async () => this.setCurrentDeviceAudio(this.userStatus.audio ? deviceNone.deviceId : this.currentDeviceAudio)
  toggleEnableVideo = async () => this.setCurrentDeviceVideo(this.userStatus.video ? deviceNone.deviceId : this.currentDeviceVideo)

  //constructor 是 WHIPContext 类的构造函数，用于在创建 WHIPContext 实例时初始化一些属性
  constructor(id: string) {
    super(id)//super(id) 调用了父类 Context 的构造函数，并传递了 id 参数
    this.cache = this.clone()//用于保存 WHIPContext 实例的当前具体的属性和方法，类型为 WHIPData
  }

  
  //实现了用户状态的同步机制，当 userStatus 发生变化时，可以通知外部模块或组件更新状态
  //setSyncUserStatus用于注册回调，syncUserStatus在注册之后成为真正的回调函数
  //之后，每当 syncUserStatus(this.userStatus) 被调用时，就会追踪最新的 userStatus
  syncUserStatus = (_: Stream) => {}
  setSyncUserStatus = (callback: (userStatus: Stream) => void) => {
    callback(this.userStatus) //将callback函数追踪到userStatus的变化
    //将callback函数赋值给syncUserStatus属性
    //此操作过后，syncUserStatus就是一个callback函数，它会在userStatus发生变化时被调用，并将最新的userStatus作为参数传入
    this.syncUserStatus = callback
  }

  setStream = (stream: MediaStream) => {
    this.stream = stream
    this.sync()//更新 cache，作用于整个实例，是一种全局同步机制
  }

  setUserName = (name: string) => {
    this.userStatus.name = name
    this.sync()
    this.syncUserStatus(this.userStatus)//作用于this.userStatus，是一种局部同步机制
  }

  //clone() 方法的作用是生成 WHIPContext 实例的状态副本，并将其返回
  clone() {
    return {
      id: this.id,
      stream: this.stream,
      userStatus: this.userStatus,
      stop: () => this.stop(),
      start: () => this.start(),
      restart: () => this.restart(),

      setUserName: (name: string) => this.setUserName(name),
      setSyncUserStatus: (callback: (userStatus: Stream) => void) => this.setSyncUserStatus(callback),

      currentDeviceAudio: this.currentDeviceAudio,
      currentDeviceVideo: this.currentDeviceVideo,
      setCurrentDeviceAudio: (current: string) => this.setCurrentDeviceAudio(current),
      setCurrentDeviceVideo: (current: string) => this.setCurrentDeviceVideo(current),
      toggleEnableAudio: () => this.toggleEnableAudio(),
      toggleEnableVideo: () => this.toggleEnableVideo(),
    }
  }
  //定义一个方法，使得外部模块可以使用 export() 方法获取到 cache
  export = () => this.cache

  sync() {
    this.cache = this.clone()
    this.dispatchEvent(event)//通知外部模块更新状态，可通过监听 event 事件来响应状态更新
  }

  /*创建一个新的 WebRTC 连接 (RTCPeerConnection)
    如果没有音视频轨道，则创建“仅发送”轨道
    如果有音视频轨道，则将音视频轨道添加到 RTCPeerConnection 中*/
  private newPeerConnection() {
    //pc：指的是 RTCPeerConnection 实例，用于管理 WebRTC 连接
    //stream：指的是当前的 MediaStream，包含音频和视频轨道
    const { pc, stream } = this

    // NOTE: array audio index is: 0
    if (!stream.getAudioTracks().length) {
      pc.addTransceiver('audio', { 'direction': 'sendonly' })
    } else {
      stream.getAudioTracks().map(track => pc.addTrack(track))
    }

    // NOTE: array video index is: 1
    if (!stream.getVideoTracks().length) {
      pc.addTransceiver('video', { 'direction': 'sendonly' })
    } else {
      stream.getVideoTracks().map(track => pc.addTrack(track))
    }
  }

  /*在音频设备更改时，用新的音频轨道替换 WebRTC 连接中的旧音频轨道，实现音频设备的无缝切换*/
  onChangedDeviceAudio() {
    const { pc, stream } = this
    // If WebRTC is connected, switch track
    // NOTE: array audio index is: 0
    pc.getSenders().filter((_, i) => i === 0).map(sender => {
      if (stream) {
        stream.getAudioTracks().map(track => sender.replaceTrack(track))
      }
    })
  }
  /*切换当前的音频设备。它接收一个音频设备 ID（current）作为参数，
  并将 WHIPContext 实例的音频轨道更新为新设备的音频流*/
  async setCurrentDeviceAudio(current: string) {
    const { stream, setStream, userStatus, currentDeviceAudio } = this

    if (current !== currentDeviceAudio || !userStatus.audio) {
      // Closed old tracks
      stream.getAudioTracks().map(track => {
        track.stop()
        stream.removeTrack(track)
      })

      const mediaStream = await asyncGetAudioStream(current)

      const videoTracks = stream.getVideoTracks()
      const audioTracks = mediaStream.getAudioTracks()

      setStream(new MediaStream([...audioTracks, ...videoTracks]))
      userStatus.audio = current === deviceNone.deviceId ? false : true
      this.currentDeviceAudio = current === deviceNone.deviceId ? this.currentDeviceAudio : current

      this.sync()
      this.syncUserStatus(userStatus)
      this.onChangedDeviceAudio()
    }
  }
   /*在视频设备更改时，用新的视频轨道替换 WebRTC 连接中的旧视频轨道，实现视频设备的无缝切换*/
  onChangedDeviceVideo() {
    const { pc, stream } = this
    // If WebRTC is connected, switch track
    // NOTE: array video index is: 1
    pc.getSenders().filter((_, i) => i === 1).map(sender => {
      if (stream) {
        stream.getVideoTracks().map(track => sender.replaceTrack(track))
      }
    })
  }

  async setCurrentDeviceVideo(current: string) {
    const { stream, setStream, userStatus, currentDeviceVideo } = this

    if (current !== currentDeviceVideo || !userStatus.video) {
      // Closed old tracks
      stream.getVideoTracks().map(track => {
        track.stop()
        stream.removeTrack(track)
      })

      const mediaStream = await asyncGetVideoStream(current)
      const audioTracks = stream.getAudioTracks()
      const videoTracks = mediaStream.getVideoTracks()

      setStream(new MediaStream([...audioTracks, ...videoTracks]))
      userStatus.video = current === deviceNone.deviceId ? false : true
      // NOTE: screen share
      userStatus.screen = current !== deviceScreen.deviceId ? false : true
      this.currentDeviceVideo = current === deviceNone.deviceId ? this.currentDeviceVideo : current

      this.sync()
      this.syncUserStatus(userStatus)
      this.onChangedDeviceVideo()
    }
  }
  //监听 WebRTC 连接状态StreamState的变化,并同步状态
  onconnectionstatechange = () => {
    this.userStatus.state = this.pc.connectionState as StreamState
    this.sync()
    this.syncUserStatus(this.userStatus)
  }
  /*启动 WebRTC 连接，并通过 WHIPClient 将连接发布到服务器*/ 
  async start() {
    const { id, pc, stream, client, userStatus } = this
    if (stream.getTracks().length === 0) return
    pc.addEventListener("connectionstatechange", this.onconnectionstatechange)
    userStatus.state = StreamState.Signaled
    this.sync()
    this.syncUserStatus(userStatus)
    this.newPeerConnection()

    try {
      const url = location.origin + `/whip/${id}`//发布 URL：生成一个 URL（location.origin + /whip/${id}），通常为服务器的路径，用于接收 WebRTC 连接的发布请求
      await client.publish(pc, url)//发布连接：client.publish(pc, url) 使用 WHIPClient 发布 WebRTC 连接，使其在服务器上可用
    } catch (e) {
      console.log(e)
      userStatus.state = StreamState.Failed
      this.syncUserStatus(userStatus)
      this.sync()
    }
    //在连接后定期5秒执行 run()，以检查并维护连接的稳定性
    if (!this.timer) this.timer = setInterval(() => this.run(), 5000)
  }
  /*停止 WebRTC 连接和相关的定时任务*/ 
  async stop() {
    if (!!this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    try {
      await this.client.stop()//中断与服务器的连接，停止音视频流的传输
      this.pc.removeEventListener("connectionstatechange", this.onconnectionstatechange)
    } catch (e) {
      console.log(e)
    }
  }
  /*重新启动 WebRTC 连接*/
  async restart() {
    await this.stop()
    this.pc = new RTCPeerConnection()
    await this.start()
  }

  /*监控 WebRTC 连接状态，并在连接状态异常时自动重启连接*/ 
  run() {
    // WatchDog, Auto Restart
    const restartStates = [StreamState.Disconnected, StreamState.Closed, StreamState.Failed]
    if (restartStates.find(i => i === this.userStatus.state)) this.restart()
  }
}

//定义了一个名为 contexts 的数组，用于存储多个 WHIPContext 实例
const contexts: WHIPContext[] = []

/*自定义的 React Hook，用于管理和使用 WHIPContext 实例
确保在有多个 WebRTC 连接时，每个连接都具有唯一的 WHIPContext 实例
通过 useSyncExternalStore，它可以在外部组件中订阅 WHIPContext 实例的状态变化，使状态变化能够自动触发组件更新*/
export default function useWhipClient(id: string) {
  const newContext = (id: string) => {
    const context = new WHIPContext(id)
    contexts.push(context)
    return context
  }
  //通过 contexts.find，检查 contexts 数组中是否已有 id 相同的 WHIPContext 实例
  //如果存在：使用已存在的实例
  //如何不存在：调用 newContext(id) 创建新的实例并使用它
  const context = contexts.find(ctx => ctx.id === id) || newContext(id)
  return useSyncExternalStore((callback: () => void) => {
    context.addEventListener(event.type, callback)//将 callback 绑定为监听器，监听 event.type 事件
    return () => {
      context.removeEventListener(event.type, callback)
    }
  }, () => context.export())//返回 WHIPContext 实例的最新状态（即缓存的状态副本 cache），作为初始值
}
