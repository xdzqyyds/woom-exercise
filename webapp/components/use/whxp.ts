/*整个文件的主要作用是 定义一个媒体流和 WebRTC 连接的上下文管理类 Context，
该类封装了 WebRTC 连接的启动、停止和重启，
并使用 EventTarget 提供 事件触发和监听功能
*/

import { Stream, StreamState } from '../../lib/api'

// 创建一个新的自定义事件 'sync'，在 Context 中用来触发同步操作
const event = new Event('sync')

// 定义 Data 接口，以及 stop、start、restart 三个控制流的异步方法
interface Data {
  id: string,
  stream: MediaStream,
  userStatus: Stream,  // 用户的流状态，包含音视频等属性

  // 以下是媒体流的控制方法，返回一个 Promise<void> 类型
  stop: () => Promise<void>//停止流的操作
  start: () => Promise<void>//开始流的操作
  restart: () => Promise<void>//重启流的操作
}

// 定义 Context 类，该类继承自 EventTarget，以便可以触发和监听事件
class Context extends EventTarget {
  id: string = ""//Context 的唯一 ID
  pc: RTCPeerConnection = new RTCPeerConnection()// WebRTC 连接对象，用于传输媒体流
  stream: MediaStream = new MediaStream()// 用于存储媒体流的对象
  userStatus: Stream = {// 用户的流状态，包含音视频等属性
    name: "",
    state: StreamState.New,
    audio: true,
    video: true,
    screen: false,
  }
// 定时器，用于定期执行某些操作，例如监控连接状态
  timer: ReturnType<typeof setInterval> | null = null

  // 构造函数，初始化 Context 实例时设置 ID
  constructor(id: string) {
    super() // 调用父类 EventTarget 的构造函数
    this.id = id    // 设置 Context 的 ID
  }

  async stop() {}
  async start() {}
  async restart() {
    await this.stop()// 首先停止当前的流和连接
    this.pc = new RTCPeerConnection()// 创建一个新的 RTCPeerConnection 实例
    await this.start()// 重新启动流
  }
}
// 导出 Context 类和 event 事件，以便在其他模块中使用
export {
  Context,
  event,
}
//导出 Data 接口类型
export type {
  Data,
}
