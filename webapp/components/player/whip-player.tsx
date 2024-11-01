/*负责推流，显示音视频流的播放界面，提供了用户状态的详细信息和流重启的功能*/ 
import { useEffect } from 'react'
import useWhipClient from '../use/whip'
import { useAtom } from 'jotai'
import Detail from './detail'
import Player from './player'
import { presentationStreamAtom } from '../../store/atom'

export default function WhipPlayer(props: { streamId: string, width: string }) {
  const { stream, userStatus, restart } = useWhipClient(props.streamId)
  const [, setPresentationStream] = useAtom(presentationStreamAtom)

//useEffect 钩子函数用于监听 userStatus.screen，当其变化时触发，确保屏幕共享状态及时更新
  useEffect(() => {
    setPresentationStream({
      name: userStatus.name + "Presentation",
      stream: userStatus.screen ? stream : new MediaStream(),
    })
  }, [userStatus.screen])

  return (
    <center className='flex flex-col'>
    {/*通过参数配置，确保 Player 只播放视频部分，而不会播放音频*/}
      <Player stream={stream} muted={true} width={props.width} audio={false} video={userStatus.video} />
    {/*Detail 提供用户的连接和流状态的详细信息，并允许重启流连接*/}
      <Detail streamId={props.streamId} connStatus={userStatus.state} userStatus={userStatus} restart={restart} />
    </center>
  )
}
