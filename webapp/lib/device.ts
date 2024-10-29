// 设备接口定义
interface Device {
    deviceId: string,
    label: string,
  }
  
  // 定义无设备对象，表示没有选中的设备
  const deviceNone = {
    deviceId: "none",
    label: "none",
  }
  
  // 定义屏幕设备对象，表示屏幕共享设备
  const deviceScreen = {
    deviceId: "screen",
    label: "screen",
  }

  // getUserMedia 是一个异步函数，它接受一个配置对象，指定请求的媒体类型和约束条件
  // 在调用此方法时，浏览器会请求用户的权限以访问摄像头和麦克风
  
  // 异步获取音频流的函数，根据设备ID获取流
  async function asyncGetAudioStream(deviceId: string): Promise<MediaStream> {
    let stream: MediaStream = new MediaStream
    if (deviceId !== "none") {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: deviceId }, video: false })
    }
    return stream
  }
  
  // 异步获取视频流的函数，根据设备ID获取流
  async function asyncGetVideoStream(deviceId: string): Promise<MediaStream> {
    let stream: MediaStream = new MediaStream
    if (deviceId === "none") {
    } else if (deviceId === "screen") {
      stream = await navigator.mediaDevices.getDisplayMedia({ audio: false, video: { width: 640 } })
    } else {
      stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { width: 320, deviceId: deviceId } })
    }
    return stream
  }
  
  // 导出异步获取音频流和视频流的函数以及设备对象
  export {
    asyncGetAudioStream,
    asyncGetVideoStream,
    deviceNone,
    deviceScreen,
  }
  
  // 导出设备接口类型
  export type {
    Device
  }