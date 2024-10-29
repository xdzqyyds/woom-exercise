//localStorage 是浏览器提供的一种 Web 存储 API
//用于在客户端（用户的浏览器）持久化存储少量数据
//它允许开发者将数据保存在用户的浏览器中，以便在页面刷新或用户重新访问时可以继续使用

// 存储键常量,用于在 localStorage 中标识不同的存储项
const MeetingKey = 'meeting'
const StreamKey = 'stream'
const TokenKey = 'token'
const NameKey = 'name'

// 定义接口用于描述储存对象的可选属性（允许对象不包含该属性）
interface Storage {
  meeting?: string,
  stream?: string,
  token?: string,
  name?: string,
}


//每个函数接受一个字符串参数 value，然后将 value 存储到 localStorage 不同的存储项中
// 设置会议存储
function setStorageMeeting(value: string) { localStorage.setItem(MeetingKey, value) }
// 设置流存储
function setStorageStream(value: string) { localStorage.setItem(StreamKey, value) }
// 设置令牌存储
function setStorageToken(value: string) { localStorage.setItem(TokenKey, value) }
// 设置名称存储
function setStorageName(value: string) { localStorage.setItem(NameKey, value) }

//每个函数从 localStorage 中获取指定键对应的值，若不存在，则返回空字符串 "" 作为默认值
// 获取会议存储
function getStorageMeeting(): string { return localStorage.getItem(MeetingKey) || "" }
// 获取流存储
function getStorageStream(): string { return localStorage.getItem(StreamKey) || "" }
// 获取令牌存储
function getStorageToken(): string { return localStorage.getItem(TokenKey) || "" }
// 获取名称存储
function getStorageName(): string { return localStorage.getItem(NameKey) || "" }

//每个函数使用 localStorage.removeItem 删除指定键的存储值
// 删除会议存储
function delStorageMeeting() { localStorage.removeItem(MeetingKey) }
// 删除流存储
function delStorageStream() { localStorage.removeItem(StreamKey) }
// 删除令牌存储
function delStorageToken() { localStorage.removeItem(TokenKey) }
// 删除名称存储
function delStorageName() { localStorage.removeItem(NameKey) }

// 设置存储的通用方法，一次性存储多个项，相当于上面存储函数的整合封装
function setStorage(opt: Storage) {
  if (opt.meeting) setStorageMeeting(opt.meeting)
  if (opt.stream) setStorageStream(opt.stream)
  if (opt.token) setStorageToken(opt.token)
  if (opt.name) setStorageName(opt.name)
}

// 获取所有存储内容，相当于上面获取函数的整合封装
function getStorage(): Storage {
  return {
    meeting: getStorageMeeting(),
    stream: getStorageStream(),
    token: getStorageToken(),
    name: getStorageName(),
  } as Storage
}

// 删除所有存储内容，相当于上面删除函数的整合封装
function delStorage() {
  delStorageMeeting()
  delStorageStream()
  delStorageToken()
  delStorageName()
}

// 导出存储相关函数
export {
  setStorageMeeting,
  setStorageStream,
  setStorageToken,
  setStorageName,

  getStorageMeeting,
  getStorageStream,
  getStorageToken,
  getStorageName,

  setStorage,
  getStorage,
  delStorage,
}