import { atom } from 'jotai'
import { atomWithLocation } from 'jotai-location'

// 创建一个用于存储位置信息的atom
const locationAtom = atomWithLocation()
locationAtom.debugLabel = 'location'

// 定义用户流接口
interface UserStream {
  stream: MediaStream,
  name: string
}

// 定义用户状态接口
interface UserStatus {
  // Nick Name
  name: string

  // Reference: https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/connectionState#value
  state: string
  audio: boolean
  video: boolean
  screen: boolean
}

// 创建一个用于存储会议ID的atom
const meetingIdAtom = atom("")
meetingIdAtom.debugLabel = 'meetingIdAtom'

// 创建一个用于存储会议加入状态的atom
const meetingJoinedAtom = atom(false)
meetingJoinedAtom.debugLabel = 'meetingJoined'

// 创建一个用于存储演示流的atom
const presentationStreamAtom = atom<UserStream>({
  stream: new MediaStream,
  name: "Presentation",
})
presentationStreamAtom.debugLabel = 'presentationStream'

// 创建一个用于检查演示是否启用的atom
const enabledPresentationAtom = atom(get => get(presentationStreamAtom).stream.getVideoTracks().length !== 0)
enabledPresentationAtom.debugLabel = 'enabledPresentation'

// 导出相关的atom
export {
  locationAtom,
  presentationStreamAtom,

  meetingIdAtom,
  meetingJoinedAtom,
  enabledPresentationAtom,
}

// 导出类型
export type {
  UserStream,
  UserStatus,
}