/* 这段代码实现了一个多用户会议布局，
包括推流、拉流、设备管理、会议 ID 分享和结束会议功能，
使得用户可以方便地控制和查看会议中的视频流和状态*/
import { useEffect, useState } from 'react'
import { useAtom } from 'jotai'
import Player from './player/player'
import WhipPlayer from './player/whip-player'
import WhepPlayer from './player/whep-player'
import DeviceBar from './devicebar'
import {
  UserStatus,
  enabledPresentationAtom,
  meetingJoinedAtom,
  presentationStreamAtom,
} from '../store/atom'
import copy from 'copy-to-clipboard'
import SvgDone from './svg/done'
import SvgEnd from './svg/end'
import { getRoom, delStream, Stream } from '../lib/api'
import { getStorageStream } from '../lib/storage'

export default function Layout(props: { meetingId: string }) {
  const [copyStatus, setCopyStatus] = useState(false)
  const [_, setMeetingJoined] = useAtom(meetingJoinedAtom)

  const localStreamId = getStorageStream()
  //管理远程用户状态
  const [remoteUserStatus, setRemoteUserStatus] = useState<{ [_: string]: UserStatus }>({})

  //const [speaker, setSpeaker] = useState<UserStatus | null>(null)
  //const [speakerId, setSpeakerId] = useState<string>("")
  const [enabledPresentation] = useAtom(enabledPresentationAtom)
  const [presentationStream] = useAtom(presentationStreamAtom)

  //定义刷新函数，用于定期获取远程用户状态
  const refresh = async () => {
    const data = (await getRoom(props.meetingId)).streams//获取所有流信息
    const r = Object.keys(data)
      .filter(i => i !== localStreamId)//过滤掉本地流ID
      .filter(i => !!i)//确保流ID不为空
      .reduce((map, i) => {
        map[i] = data[i]//将每个远程用户的流状态添加到map
        return map
      }, {} as { [_: string]: Stream })
    setRemoteUserStatus(r)//更新远程用户状态
  }

 // 结束通话函数，删除本地流并退出会议
  const callEnd = async () => {
    delStream(props.meetingId, localStreamId)

    setMeetingJoined(false)
  }

  //useEffect(() => {
  //  let shareScreenId = ""
  //  const setShareScreenId = (id: string) => shareScreenId = id
  //  Object.keys(remoteUserStatus).map(i => remoteUserStatus[i].screen && setShareScreenId(i))
  //  if (!shareScreenId) {
  //    setSpeakerId("")
  //    setSpeaker(null)
  //  } else {
  //    setSpeakerId(shareScreenId)
  //    setSpeaker(remoteUserStatus[shareScreenId])
  //  }
  //}, [remoteUserStatus])

// 每 3 秒自动刷新远程用户状态
  useEffect(() => {
    const handle = setInterval(refresh, 3000)
    return () => clearInterval(handle)
  }, [])

  return (
    <div className='flex flex-col justify-between' style={{ height: '100vh' }}>
      <div></div>
    {/* 演示流模式：如果启用，则显示演示流 */}
      { enabledPresentation
        ? <Player stream={presentationStream.stream} muted={true} width="auto" display="auto" />
        : null
      }
      {/* 用户视频区域 */}
      <div className='flex flex-row flex-wrap justify-evenly'>
        <WhipPlayer streamId={localStreamId} width="320px" />
        {Object.keys(remoteUserStatus).map(i => <WhepPlayer key={i} streamId={i} userStatus={remoteUserStatus[i]} width="320px" />)}
      </div>
  {/* 底部工具栏 */}
      <center>
        <div className='flex justify-evenly bg-gray-800/80'>
        {/* 会议 ID 复制按钮 */}
          <section className='hidden md:flex md:flex-col md:justify-center'>
            <button className='flex flex-row text-rose-400 rounded-md bg-inherit p-2' onClick={() => {
              copy(location.href)//复制当前页面URL
              setCopyStatus(true)//显示复制成功的提示
              setTimeout(() => setCopyStatus(false), 3000)//3秒后隐藏提示
            }}>
              <code className='mx-sm my-1px'>{props.meetingId}</code>
              <center className='text-rose-400 rounded-md' style={{ visibility: copyStatus ? 'visible' : 'hidden' }} >
                <SvgDone />
              </center>
            </button>
          </section>
      {/* 设备管理栏 */}
          <DeviceBar streamId={localStreamId} />{/* 设备切换和控制组件 */}
    {/* 结束会议按钮 */}
          <section className='flex flex-col justify-center'>
            <button className='text-white bg-rose-600 hover:bg-rose-700 duration-1000 shadow-xl rounded-3xl w-18 h-10' onClick={() => callEnd()}>
              <center>
                <SvgEnd />
              </center>
            </button>
          </section>

        </div>
      </center>

    </div>
  )
}
