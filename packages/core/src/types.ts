export const key = '__type__'
export type Data = any
export type RandomStr = string
export type MessageType = string
export type MessageTypeJSON = {
  from: Messager;
  fromKey: string;
  to: Messager;
  toKey: string;
  seed: RandomStr;
  contents?: { type: Messager, key: string }[];
}
export type MessagerData = {
  from: Messager,
  fromKey: string;
  to: Messager,
  toKey: string;
  sender?: any,
}
export type MessageData = {
  [key]: MessageType,
  data?: Data,
}
export type RootCallback<T> = (message: T, sendResponse: (data?: any) => void, messager: MessagerData) => void | Promise<void>
export type ContentCallback<T> = (message: T, sendResponse: (data?: any) => void, messager: MessagerData) => void | boolean | Promise<void | boolean>
export type PageCallback<T> = (message: T, messager: MessagerData) => void | Promise<void>

export enum Messager {
  Root = 'ROOT',
  Content = 'CONTENT',
  Page = 'PAGE',
}