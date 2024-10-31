import { atom } from 'jotai'
import { atomWithLocation } from 'jotai-location'

// 创建一个用于存储URL位置信息的atom
//debugLabel 是一个调试标签，方便在开发时识别 locationAtom 的状态
const locationAtom = atomWithLocation()
locationAtom.debugLabel = 'location'

// 该接口用于描述用户的媒体流
interface UserStream {
  stream: MediaStream,
  name: string
}

// 该接口定义用户状态信息
interface UserStatus {
  name: string
  state: string
  audio: boolean
  video: boolean
  screen: boolean
}

// 创建一个用于存储会议ID的atom,初始值为空字符串 ""
//通过 debugLabel 设置调试标签为 meetingIdAtom
const meetingIdAtom = atom("")
meetingIdAtom.debugLabel = 'meetingIdAtom'

// 创建一个标记用户是否已加入会议的atom,初始值为 false
const meetingJoinedAtom = atom(false)
meetingJoinedAtom.debugLabel = 'meetingJoined'

// 创建一个用于存储屏幕共享流的atom,数据类型为 UserStream
//stream 是一个新的 MediaStream 实例
//name 是一个字符串，表示演示的名称
const presentationStreamAtom = atom<UserStream>({
  stream: new MediaStream,
  name: "Presentation",
})
presentationStreamAtom.debugLabel = 'presentationStream'

// 创建一个用于检查演示Presentation是否启用的atom
// 初始值为 false，当 presentationStreamAtom 的 stream 存在且包含视频轨道时，设置为 true
//这里的 get => ... 是一个回调函数，Jotai 使用它来获取其他 atom 的值。在这个例子中，get 参数表示一个获取其他 atom 值的函数
const enabledPresentationAtom = atom(get => get(presentationStreamAtom).stream.getVideoTracks().length !== 0)
enabledPresentationAtom.debugLabel = 'enabledPresentation'

// 将创建的 atom 导出，以便在其他文件中引用这些状态单元
export {
  locationAtom,
  presentationStreamAtom,

  meetingIdAtom,
  meetingJoinedAtom,
  enabledPresentationAtom,
}

// 导出接口类型，以便其他文件可以引用这些接口
export type {
  UserStream,
  UserStatus,
}