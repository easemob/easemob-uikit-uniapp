const CHAT_STORE = "chat";
const SERVER_CONFIG_STORE = "serverConfig";

const serverConfig = uni.getStorageSync(SERVER_CONFIG_STORE) || {};
const IS_USE_CUSTOM_SERVER = serverConfig.isUseCustomServer || false; // 是否使用自定义服务器
const APPKEY = serverConfig.appkey || "your#appkey"; // 环信appkey
// 例如: https://a1.easemob.com
const API_URL = serverConfig.restUrl || ""; // 环信api地址 
// 例如: wss://im-api-wechat.easemob.com/websocket 
const URL = serverConfig.url || ""; // 环信websocket地址 


const APP_SERVER_URL = "";

// Demo内部上传头像地址 (仅支持官方appkey使用)
const getInsideUploadUrl = (userId: string) => {
  return `${APP_SERVER_URL}/inside/app/user/${userId}/avatar/upload`;
};

// Demo内部获取群头像地址 (仅支持官方appkey使用)
const getInsideGroupAvatarUrl = (groupId: string) => {
  return `${APP_SERVER_URL}/inside/app/group/${groupId}/avatarurl`;
};

export {
  CHAT_STORE,
  SERVER_CONFIG_STORE,
  APPKEY,
  API_URL,
  URL,
  IS_USE_CUSTOM_SERVER,
  APP_SERVER_URL,
  getInsideUploadUrl,
  getInsideGroupAvatarUrl
};
