import { atom } from 'jotai'
import { atomWithLocation } from 'jotai-location'

<<<<<<< HEAD
// 创建一个用于存储URL位置信息的atom,其初始值由 atomWithLocation 创建
//debugLabel 属性设置调试标签，方便在调试工具中识别该 atom
=======
// 创建一个用于存储URL位置信息的atom
//debugLabel 是一个调试标签，方便在开发时识别 locationAtom 的状态
>>>>>>> 039ccc108217766f1ee7a856ae45487ce0bb4542
const locationAtom = atomWithLocation()
locationAtom.debugLabel = 'location'

// 该接口用于描述用户的媒体流
interface UserStream {
  stream: MediaStream,
  name: string
}

// 该接口定义用户状态信息
interface UserStatus {
  // Nick Name
  name: string

  // Reference: https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/connectionState#value
  state: string
  audio: boolean
  video: boolean
  screen: boolean
}

<<<<<<< HEAD
// 创建一个用于存储会议ID的atom
//通过 debugLabel 设置调试标签 meetingIdAtom
const meetingIdAtom = atom("")
meetingIdAtom.debugLabel = 'meetingIdAtom'

// 创建一个用于存储会议加入状态的布尔值atom，默认值为false
// 通过 debugLabel 设置调试标签 meetingJoined
const meetingJoinedAtom = atom(false)
meetingJoinedAtom.debugLabel = 'meetingJoined'

// 创建一个用于存储演示流（例如共享屏幕）的atom
//
=======
// 创建一个用于存储会议ID的atom,初始值为空字符串 ""
//通过 debugLabel 设置调试标签为 meetingIdAtom
const meetingIdAtom = atom("")
meetingIdAtom.debugLabel = 'meetingIdAtom'

// 创建一个标记用户是否已加入会议的atom,初始值为 false
const meetingJoinedAtom = atom(false)
meetingJoinedAtom.debugLabel = 'meetingJoined'

// 创建一个用于存储演示流的atom,数据类型为 UserStream
//stream 是一个新的 MediaStream 实例
//name 是一个字符串，表示演示的名称
>>>>>>> 039ccc108217766f1ee7a856ae45487ce0bb4542
const presentationStreamAtom = atom<UserStream>({
  stream: new MediaStream,
  name: "Presentation",
})
presentationStreamAtom.debugLabel = 'presentationStream'

// 创建一个用于检查演示Presentation是否启用的atom
// 初始值为 false，当 presentationStreamAtom 的 stream 存在且包含视频轨道时，设置为 true
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