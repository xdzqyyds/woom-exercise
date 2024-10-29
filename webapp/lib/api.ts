

// 定义房间接口
interface Room {
    roomId: string,
    locked: false,
    owner: string,
    presenter?: string,
    streams: any,
  }
  
  // 参考: https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/connectionState#value
  // 定义流状态枚举
  enum StreamState {
    New = "new",
    Signaled = "signaled",
    Connecting = "connecting",
    Connected = "connected",
    Disconnected = "disconnected",
    Failed = "failed",
    Closed = "closed",
  }
  
  // 定义流接口,state：流的连接状态，类型为 StreamState 枚举
  interface Stream {
    name: string,
    state: StreamState
    audio: boolean,
    video: boolean,
    screen: boolean,
  }
  
  // 定义用户接口
  interface User {
    streamId: string,
    token: string,
  }
  
  let token = ""
  let roomId = ""
  
  // 设置API令牌
  function setApiToken(str: string) {
    token = str
  }
  
  // 设置房间ID
  function setRoomId(str: string) {
    roomId = str
  }
  
  // 创建新用户
  async function newUser(): Promise<User> {
    return (await fetch(`/user/`, {
      method: "POST",
    })).json()
  }
  
  // 创建新房间
  async function newRoom(): Promise<Room> {
    return (await fetch(`/room/`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      method: "POST",
    })).json()
  }
  
  // 获取房间信息
  async function getRoom(roomId: string): Promise<Room> {
    return (await fetch(`/room/${roomId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })).json()
  }
  
  // 更新房间信息
  async function setRoom(roomId: string, data: any): Promise<Room> {
    return (await fetch(`/room/${roomId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      method: "PATCH",
      body: JSON.stringify(data),
    })).json()
  }
  
  // 删除房间
  async function delRoom(roomId: string): Promise<void> {
    return (await fetch(`/room/${roomId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      method: "DELETE",
    })).json()
  }
  
  // 创建新流
  async function newStream(roomId: string): Promise<Stream> {
    return (await fetch(`/room/${roomId}/stream`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      method: "POST",
    })).json()
  }
  
  // 更新流信息
  async function setStream(streamId: string, data: any): Promise<Stream> {
    return (await fetch(`/room/${roomId}/stream/${streamId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      method: "PATCH",
      body: JSON.stringify(data),
    })).json()
  }
  
  // 删除流
  async function delStream(roomId: string, streamId: string): Promise<any> {
    return fetch(`/room/${roomId}/stream/${streamId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      method: "DELETE",
    })
  }
  
  // 导出相关函数
  export {
    setRoomId,
    setApiToken,
    newUser,
  
    newRoom,
    getRoom,
    setRoom,
    delRoom,
  
    newStream,
    setStream,
    delStream,
  
    StreamState,
  }
  
  // 导出流接口类型
  export type {
    Stream,
  }