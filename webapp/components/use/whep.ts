{/* 用于处理 WebRTC 拉流的 WHEPContext 类，基于 WebRTC 服务器 WHEPClient 的实现*/}
import { useSyncExternalStore } from 'react'
import { event, Context, Data } from './whxp'
import { StreamState, Stream } from '../../lib/api'
import { WHEPClient } from 'whip-whep/whep'

//继承 Data 接口并添加了 setRemoteStatus 函数，用于设置远程的用户状态
interface WHIPData extends Data {
  setRemoteStatus: (userStatus: Stream) => void,
}

//WHEPContext 类继承自 Context，负责创建和管理 WebRTC 拉流连接
class WHEPContext extends Context {
 //初始化 client 为 WHEPClient 实例，用于拉取 WebRTC 流
  client: WHEPClient = new WHEPClient()
  cache: WHIPData
  remoteStatus: Stream//新添加的属性，初始化 remoteStatus 以存储远程用户的状态
  connStatus: string = 'new'//新添加的属性，connStatus 用于存储连接状态
  constructor(id: string) {
    super(id)
    this.cache = this.clone()
    this.remoteStatus = Object.assign({}, this.userStatus)
  }

  //创建一个新的 WebRTC 连接并设置只接收远程音视频流的收发器（Transceiver）
  private newPeerConnection() {
    const { pc, setStream } = this
    //添加视频和音频的收发器（Transceiver）
    pc.addTransceiver('video', { 'direction': 'recvonly' })
    pc.addTransceiver('audio', { 'direction': 'recvonly' })
    //ontrack 事件触发时，表示从远程连接收到新的媒体轨道
    //ev.track 是接收到的媒体轨道
    //[...this.stream.getTracks(), ev.track] 的作用是将现有的 MediaStream 轨道（如之前接收到的视频轨道）和新的轨道（如音频）合并
    pc.ontrack = ev => setStream(new MediaStream([...this.stream.getTracks(), ev.track]))
  }

  setStream = (stream: MediaStream) => {
    this.stream = stream
    this.sync()
  }
    //这里的 = 将一个箭头函数赋值给 setRemoteStatus 属性，使 setRemoteStatus 成为一个方法，可以直接在类实例上调用
    //(userStatus: Stream) => this.remoteStatus = userStatus 是一个箭头函数。箭头函数的语法为 (参数) => 返回值
  setRemoteStatus = (userStatus: Stream) => this.remoteStatus = userStatus

  clone() {
    return {
      id: this.id,
      stream: this.stream,
      connStatus: this.connStatus,
      userStatus: this.userStatus,
      stop: () => this.stop(),
      start: () => this.start(),
      restart: () => this.restart(),

      setRemoteStatus: (userStatus: Stream) => this.setRemoteStatus(userStatus),
    }
  }

  export = () => this.cache

  sync() {
    this.cache = this.clone()
    this.dispatchEvent(event)
  }

  onconnectionstatechange = () => {
    this.userStatus.state = this.pc.connectionState as StreamState
    this.connStatus = this.pc.connectionState
    this.sync()
  }

  /*用于启动 WebRTC 拉流连接,指订阅端从服务器获取流的过程*/
  async start() {
    const { id, pc, client, userStatus } = this
    //给 RTCPeerConnection 的 connectionstatechange 事件绑定监听器 onconnectionstatechange
    pc.addEventListener('connectionstatechange', this.onconnectionstatechange)
    //将 userStatus.state 更新为 StreamState.Signaled，表示拉流启动的信号状态
    userStatus.state = StreamState.Signaled
    this.sync()
    this.newPeerConnection()

    //尝试拉流
    try {
      //获取拉流地址
      const url = location.origin + `/whep/${id}`
      //调用 WHEPClient 的 view 方法，用 pc 连接到指定 url，启动拉流
      await client.view(pc, url)
    } catch (e) {
      console.log(e)
      userStatus.state = StreamState.Failed
      this.sync()
    }

    if (!this.timer) this.timer = setInterval(() => this.run(), 5000)
  }

  //停止 WebRTC 连接，清理资源，移除监听器
  async stop() {
    if (!!this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    try {
      await this.client.stop()
      this.pc.removeEventListener("connectionstatechange", this.onconnectionstatechange)
    } catch (e) {
      console.log(e)
    }
  }

  //重启 WebRTC 连接，清理资源，重新创建连接
  async restart() {
    await this.stop()
    this.stream = new MediaStream()
    this.pc = new RTCPeerConnection()
    await this.start()
  }

  //un 方法是一个看门狗功能的实现，用于自动检测 WebRTC 连接状态是否异常，并在需要时触发重启逻辑
  run() {
    // WatchDog, Auto Restart
    const restartStates = [StreamState.Disconnected, StreamState.Closed, StreamState.Failed]
    if (restartStates.find(i => i === this.userStatus.state) && this.remoteStatus.state === StreamState.Connected) this.restart()
  }
}

const contexts: WHEPContext[] = []

export default function useWhepClient(id: string) {
  const newContext = (id: string) => {
    const context = new WHEPContext(id)
    contexts.push(context)
    return context
  }

  const context = contexts.find(ctx => ctx.id === id) || newContext(id)
  return useSyncExternalStore((callback: () => void) => {
    context.addEventListener(event.type, callback)
    return () => {
      context.removeEventListener(event.type, callback)
    }
  }, () => context.export())
}
