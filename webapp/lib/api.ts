

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
  
  /*
  //async：关键字表示该函数是异步函数
  //该函数返回 Promise<User> ，表示新用户的信息，类型为 User
  //fetch 是一个浏览器内置的 API，用于执行网络请求
  //  /user/ 是请求的目标 URL，假设是用于创建新用户的服务器端点
  //请求的 method 为 POST。
  //POST 用于向服务器发送数据或创建新资源，这里表示请求创建一个新用户
  //await 用于等待 fetch 请求完成
  //.json() 用于将响应体解析为 JSON 格式
  */

  // 创建新用户
  async function newUser(): Promise<User> {
    return (await fetch(`/user/`, {
      method: "POST",
    })).json()
  }
  
  //headers：请求头
  //"Authorization"：Bearer ${token} 形式的访问令牌，用于认证

  // 创建新房间
  async function newRoom(): Promise<Room> {
    return (await fetch(`/room/`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      method: "POST",
    })).json()
  }

  ///room/${roomId} 是请求的目标路径
  //该 URL 会被动态替换成包含具体 roomId 的 URL，比如 /room/12345
  //fetch 的默认方法是 GET，因此无需显式指定 method
  //getRoom 函数通过发送 GET 请求，从服务器获取指定房间的详细信息
  
  // 获取房间信息
  async function getRoom(roomId: string): Promise<Room> {
    return (await fetch(`/room/${roomId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })).json()
  }

  //"Content-Type"：设置为 "application/json"，表示请求体的数据格式为 JSON
  //method：指定 HTTP 方法为 "PATCH"，用于部分更新资源内容
  //body：请求体通过 JSON.stringify(data) 将 data 对象转换为 JSON 格式的字符串，以便服务器能够正确解析数据
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
  

  //method：指定 HTTP 方法为 DELETE，表示删除操作
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