/*主要功能是允许用户选择和切换音频、视频以及屏幕共享设备，
并查看设备的当前状态*/

import useWhipClient from "./use/whip"
import { useEffect, useState } from 'react'
import {
  Device,
  deviceNone,
  deviceScreen,
} from '../lib/device'

import Loading from './svg/loading'
import SvgAudio from './svg/audio'
import SvgVideo from './svg/video'
import { SvgPresentCancel, SvgPresentToAll } from './svg/present'

export default function DeviceBar(props: { streamId: string }) {
//权限状态：permissionAudio 和 permissionVideo：分别存储音频和视频的权限状态
  const [permissionAudio, setPermissionAudio] = useState("")
  const [permissionVideo, setPermissionVideo] = useState("")
//加载状态：分别表示音频、视频和屏幕共享设备的加载状态，初始值为 false，表示设备未在加载中
  const [loadingAudio, setLoadingAudio] = useState(false)
  const [loadingVideo, setLoadingVideo] = useState(false)
  const [loadingScreen, setLoadingScreen] = useState(false)

  //解构，即提取 useWhipClient 返回的属性和方法，便于直接访问
  const {
    userStatus,
    currentDeviceAudio,
    currentDeviceVideo,
    setCurrentDeviceAudio,
    setCurrentDeviceVideo,
    toggleEnableAudio,
    toggleEnableVideo,
  } = useWhipClient(props.streamId)

  //使用了 React 的 useState 钩子来定义和管理音视频设备的状态
  //分别用于存储可用的音频设备和视频设备列表
  const [deviceAudio, setDeviceAudio] = useState<Device[]>([deviceNone])
  const [deviceVideo, setDeviceVideo] = useState<Device[]>([deviceNone])

  //检查用户设备的摄像头和麦克风的权限状态，并将结果分别存储在音频和视频权限状态中
  //考虑了不同浏览器在权限名称上的兼容性，因此适用于跨浏览器的权限查询
  const permissionsQuery = async () =>
    (await Promise.all(["camera", "microphone"].map(
      // NOTE:
      // Firefox don't have `camera` and `microphone` in permissions
      // https://developer.mozilla.org/en-US/docs/Web/API/Permissions/query#name
      // https://searchfox.org/mozilla-central/source/dom/webidl/Permissions.webidl#10
      //
      // NOTE:
      // PermissionName
      // https://w3c.github.io/permissions/
      // Reference: https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API
      i => navigator.permissions.query({ name: i as PermissionName })
    ))).map(status => {
      // NOTE:
      // Chrome: audio_capture, video_capture
      // Safari: microphone, camera
      if (status.name === "audio_capture" || "microphone") {
        setPermissionAudio(status.state)
      }
      if (status.name === "video_capture" || "camera") {
        setPermissionVideo(status.state)
      }
    })

//用于获取并更新当前可用的音视频设备列表
//在没有选择设备时，自动选择第一个可用的音频或视频设备
  const updateDeviceList = async () => {
    const devices = (await navigator.mediaDevices.enumerateDevices()).filter(i => !!i.deviceId)
    const audios: Device[] = devices.filter(i => i.kind === 'audioinput')
    const videos: Device[] = devices.filter(i => i.kind === 'videoinput')

    if (currentDeviceAudio === deviceNone.deviceId) {
      let device = audios[0]
      if (device) await setCurrentDeviceAudio(device.deviceId)
    }

    if (currentDeviceVideo === deviceNone.deviceId) {
      let device = videos[0]
      if (device) await setCurrentDeviceVideo(device.deviceId)
    }

    setDeviceAudio([...audios])
    setDeviceVideo([...videos, deviceScreen])
  }

  //初始化函数，用于初始化音视频设备列表、权限状态和当前设备
  const init = async () => {
    try {
        // 停止所有媒体流，这样可以仅请求权限而不立即开启摄像头或麦克风
      (await navigator.mediaDevices.getUserMedia({ video: true, audio: true })).getTracks().map(track => track.stop())
      // NOTE:
      // In some device have problem:
      // - Android Web Browser
      // - Wechat WebView
      await permissionsQuery()
    } catch { }
    await updateDeviceList()
  }

  //确保 init 函数仅在组件加载时执行一次，避免在组件重新渲染时重复初始化
  useEffect(() => {
    init()
  }, [])

  //监听浏览器中音视频设备的变化事件，并在组件卸载时移除监听器
  //当用户插入新的麦克风或摄像头，或拔出设备时，会触发 devicechange 事件，从而自动更新设备列表
  useEffect(() => {
    // Reference: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/devicechange_event
    navigator.mediaDevices.addEventListener("devicechange", updateDeviceList)
    return () => { navigator.mediaDevices.removeEventListener("devicechange", updateDeviceList) }
  }, [])

  //切换当前音频设备，并在切换过程中显示加载状态
  const onChangedDeviceAudio = async (current: string) => {
    setLoadingAudio(true)
    await setCurrentDeviceAudio(current)
    setLoadingAudio(false)
  }
  //切换当前视频设备，并在切换过程中显示加载状态
  const onChangedDeviceVideo = async (current: string) => {
    setLoadingVideo(true)
    await setCurrentDeviceVideo(current)
    setLoadingVideo(false)
  }
  
//用于在屏幕共享和摄像头视频之间进行切换
  const toggleEnableScreen = async () => {
    setLoadingScreen(true)
    await onChangedDeviceVideo(userStatus.screen ? deviceNone.deviceId : deviceScreen.deviceId)
    setLoadingScreen(false)
  }

  return (
    <div className='flex flex-row flex-wrap justify-around p-xs'>
      <center className='flex flex-row flex-wrap justify-around'>
        <section className='m-1 p-1 flex flex-row justify-center rounded-md border-1 border-indigo-500'>
          <button className='text-rose-400 rounded-md w-8 h-8' onClick={async () => {
            setLoadingAudio(true)
            toggleEnableAudio()
            setLoadingAudio(false)
          }}>
            <center>{ loadingAudio ? <Loading/> : <SvgAudio/> }</center>
          </button>
          <div className='flex flex-col justify-between w-1 pointer-events-none'>
            {permissionAudio === "granted"
              ? <div></div>
              : <div className='bg-orange-500 shadow-sm w-1 h-1 p-1 rounded-full' style={{ position: 'relative', right: '7px' }}></div>
            }
            {userStatus.audio
              ? <div></div>
              : <div className='w-8 h-1 bg-red-500 rounded-full rotate-45'
                style={{
                  position: 'relative',
                  right: '32px',
                  bottom: '14px',
                }}></div>
            }
          </div>
        {/* 音频设备选择 */}
          <select
            className='w-3.5 h-8 rounded-sm rotate-180'
            value={currentDeviceAudio}
            onChange={e => onChangedDeviceAudio(e.target.value)}
          >
            {deviceAudio.map(device =>
              <option key={device.deviceId} value={device.deviceId}>{device.label}</option>
            )}
          </select>
        </section>

        <section className='m-1 p-1 flex flex-row justify-center rounded-md border-1 border-indigo-500'>
          <button className='text-rose-400 rounded-md w-8 h-8' onClick={async () => {
            setLoadingVideo(true)
            await toggleEnableVideo()
            setLoadingVideo(false)
          }}>
            <center>{ loadingVideo ? <Loading/> : <SvgVideo/> }</center>
          </button>
          <div className='flex flex-col justify-between w-1 pointer-events-none'>
            {permissionVideo === "granted"
              ? <div></div>
              : <div className='bg-orange-500 shadow-sm w-1 h-1 p-1 rounded-full' style={{ position: 'relative', right: '7px' }}></div>
            }
            {userStatus.video
              ? <div></div>
              : <div className='w-8 h-1 bg-red-500 rounded-full rotate-45'
                style={{
                  position: 'relative',
                  right: '32px',
                  bottom: '14px',
                }}></div>
            }
          </div>
          <select
            className='w-3.5 h-8 rounded-sm rotate-180'
            value={currentDeviceVideo}
            onChange={e => onChangedDeviceVideo(e.target.value)}
          >
            {deviceVideo.map(device =>
              <option key={device.deviceId} value={device.deviceId}>{device.label}</option>
            )}
          </select>
        </section>
      </center>
      {/* 屏幕共享按钮 */}
      <center>
        <section className='m-1 p-1 flex flex-row justify-center rounded-md border-1 border-indigo-500'>
          <button className='text-rose-400 rounded-md w-8 h-8' onClick={() => toggleEnableScreen()}>
            <center>
              {loadingScreen
                ? <Loading />
                : userStatus.screen ? <SvgPresentCancel /> : <SvgPresentToAll />
              }
            </center>
          </button>
        </section>

      </center>
    </div>
  )
}
