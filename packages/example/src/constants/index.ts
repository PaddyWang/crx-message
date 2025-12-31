/** 消息类型 */
export enum MessageType {
  ContentMessage = 'ContentMessage',
  PageMessage = 'PageMessage',
}

/** 消息模型 */
export enum MessageModel {
  Root = 'Root',
  Content = 'Content', // 内容脚本模型
  ContentPage = 'ContentPage',  // 内容脚本模型
  Page = 'Page',  // 页面脚本模型
}

export interface MessageData {
  type: MessageType,
  data?: any,
}
