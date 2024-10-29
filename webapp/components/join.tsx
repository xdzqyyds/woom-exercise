import { useEffect, useState } from 'react'
import { useAtom } from 'jotai'
import {
    locationAtom,
    meetingIdAtom,
  } from '../store/atom'
import { getStorage, setStorage, delStorage, setStorageStream, setStorageMeeting } from '../lib/storage'
import { newRoom, newUser, setApiToken, setRoomId } from '../lib/api'


// 加入会议组件
export default function Join() {
  //loc读取locationAtom状态，setLoc用于设置更新locationAtom状态
  const [loc, setLoc] = useAtom(locationAtom)
  // setAtomMeetingId设置更新 meetingIdAtom状态, __ 是占位符，这里不需要读取 meetingIdAtom 的值
  const [__, setAtomMeetingId] = useAtom(meetingIdAtom)
  //tmpId 存储用户输入的会议 ID，初始为空字符串，setTmpId用于设置更新输入
  const [tmpId, setTmpId] = useState<string>("")

  // 获取登录状态
  const getLoginStatus = async () => {
    //获取Storage信息
    const user = getStorage()
    //如果没有用户令牌或者用户流，则创建新用户，并将令牌和流存入Storage
    if (!user.token || !user.stream) {
      const res = await newUser()
      user.token = res.token,
      user.stream = res.streamId,
      setStorage(user)
    }
    //将 user.token 的值设置到全局变量token 上
    setApiToken(user.token)

    
    //如果有流，则存入Storage
    if (user.stream) setStorageStream(user.stream)
  }

  // 创建新的会议
  const newMeeting = async () => {
    await getLoginStatus()
    let meetingId = (await newRoom()).roomId
    enterMeeting(meetingId)
    //将meetingId的值设置到全局变量roomId上
    setRoomId(meetingId)
  }

  // 加入已存在的会议
  const joinMeeting = async () => {
    await getLoginStatus()
    //读取用户输入的会议ID
    let meetingId = tmpId
    //await fetch(`/room/${meetingId}`, {
    //  method: "PATCH"
    //})
    enterMeeting(meetingId)
    setRoomId(meetingId)
  }

  // 进入会议
  const enterMeeting = (meetingId: string) => {
    //将meetingId存入Storage
    setStorageMeeting(meetingId)
    //更新meetingIdAtom
    setAtomMeetingId(meetingId)
    //更新 locationAtom 的 pathname，将 URL 改为 /{meetingId}，以便用户进入会议页面
    setLoc(prev => ({ ...prev, pathname: `/${meetingId}` }))
  }

  //useEffect：当 location 发生变化时执行，这里指在URL发生变化时执行

  useEffect(() => {
    //提取URL中的会议ID
    const id = loc.pathname?.replace("/", "")
    //如果URL中有会议ID，则将其存入tmpId
    if (id) {
      setTmpId(id)
    }
  }, [location])

  return (
    <div className='flex flex-col justify-around bg-gray-800/80 p-6 my-4'>
      <center className='flex flex-row flex-wrap justify-center'>
        {/* New Meeting按钮 */}
        <button className='btn-primary my-2' disabled={!!tmpId} onClick={() => { newMeeting() }}>New Meeting</button>
        {/* 输入框，用于输入会议ID */}
        <div className='mx-2 my-2'>
          <input
            className='text-center text-4xl'
            placeholder='Enter Meeting id'
            value={tmpId}
            onChange={e => setTmpId(e.target.value)}
            maxLength={11}
          />
        </div>
        {/* Join按钮 */}
        <button className='btn-primary my-2' disabled={!tmpId} onClick={() => { joinMeeting() }}>Join</button>
      </center>
        {/* Reset按钮 */}
      <center className='flex flex-row flex-wrap justify-center text-white'>
        <p>If have some problems, Please click this:</p>
        <a className='mx-2 text-red-300 underline' onClick={delStorage}>Reset</a>
      </center>
    </div>
  )
}