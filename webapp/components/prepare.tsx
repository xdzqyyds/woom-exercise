/*会议准备界面，用户可以在加入会议前设置自己的名称、音视频设备，并预览视频流*/
import { useEffect, useState } from 'react'
import { useAtom } from 'jotai'
import useWhipClient from "./use/whip"
import DeviceBar from './devicebar'
import Loading from "./svg/loading"
import Player from './player/player'
import {
  meetingJoinedAtom,
} from '../store/atom'
import { getStorageName, setStorageName, getStorageStream } from '../lib/storage'
import { setStream } from '../lib/api'

export default function Prepare(props: { meetingId: string }) {
  const [loading, setLoading] = useState<boolean>(false)

  const [displayName, setDisplayName] = useState<string>("")

  const localStreamId = getStorageStream()
  const [_, setMeetingJoined] = useAtom(meetingJoinedAtom)

  //通过 useWhipClient(localStreamId) 获取当前音视频流的相关信息和控制函数
  // id: 当前用户的ID   stream：本地的音视频流，用于传递给播放器组件 Player
  //setUserName：设置用户名，用于在会议中标识用户  setSyncUserStatus：用于同步用户状态到服务器
  //start：启动音视频流连接
  const { id, stream, setUserName, setSyncUserStatus, start } = useWhipClient(localStreamId)

  //加入会议函数 join
  const join = async () => {
    setLoading(true)

    setUserName(displayName || localStreamId)

    setMeetingJoined(true)
    setStorageName(displayName)
    await start()
    setSyncUserStatus((status) => setStream(id, status))
    setLoading(false)
  }
  //在组件首次加载时执行，将本地存储的名称（如果存在）设置为 displayName 的初始值
  //空依赖数组，确保 useEffect 只在组件加载时执行一次
  useEffect(() => {
    setDisplayName(getStorageName() || "")
  }, [])

  return (
    <div className='flex flex-col justify-around'>
      <center className='m-xs'>
      {/* Player 组件用于预览视频流，传递 stream、muted 等属性，以显示视频或音频波形*/}
        <Player stream={stream} muted={true} width="320px" audio={true} video={true} />
      </center>
      {/* 渲染一个input输入框，用于输入用户名，并将其存储到localStorage中 */}
      <center className='mb-xs'>
        <label className='text-white'>Your Name: </label>
        <input
          className='text-center'
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
        />
      </center>
      {/* DeviceBar 组件用于显示和选择音视频设备,将 localStreamId 传递给它 */}
      <div className='flex justify-evenly bg-gray-800/80'>
        <DeviceBar streamId={localStreamId} />
      </div>
      {/*按钮触发 join 函数，进入会议*/}
      <center className='m-xs'>
        <button className='btn-primary flex flex-row justify-center' onClick={() => { join() }}>
          {loading
            ? <center className='m-2px mr-3'><Loading /></center>
            : null
          }
          Join
          {loading
            ? "..."
            : null
          }

        </button>
      </center>

    </div>
  )
}
