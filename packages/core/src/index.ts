import {
  key,
  RandomStr,
  MessageType,
  RootCallback,
  MessageData,
  MessageTypeJSON,
  Messager,
  MessagerData,
  ContentCallback,
  PageCallback,
} from './types'

class Base {
  flagKey: typeof key = key
  rootKey: string
  splitChar = '|'
  connectChar = '@'

  constructor (rootKey: string) {
    this.flagKey += rootKey
    this.rootKey = rootKey
  }

  random (): RandomStr {
    return Math.random().toString(36).substring(2, 15)
  }
  messageTypeParse (type: MessageType): MessageTypeJSON {
    const typeArr = type.split(this.splitChar)
    const fromer = typeArr.shift()
    const seed = typeArr.pop() || ''
    const toer = typeArr.pop()
    const [from, fromKey] = fromer?.split(this.connectChar) as [Messager, string]
    const [to, toKey] = toer?.split(this.connectChar) as [Messager, string]
    return {
      from,
      fromKey,
      to,
      toKey,
      seed,
      contents: typeArr.map((keyStr) => {
        const [type, key] = keyStr.split(this.connectChar)
        return { type: type as Messager, key }
      }),
    }
  }
  messageTypeStringify (typeJson: MessageTypeJSON, reverse?: boolean): MessageType {
    const typeArr = [
      { type: typeJson.from, key: typeJson.fromKey },
      ...(typeJson.contents || []),
      { type: typeJson.to, key: typeJson.toKey }
    ][reverse ? 'reverse' : 'slice']().map(item => `${item.type}${this.connectChar}${item.key}`)
    typeArr.push(typeJson.seed)
    return typeArr.join(this.splitChar)
  }
  messageTypeReverse (type: MessageType): MessageType {
    return this.messageTypeStringify(this.messageTypeParse(type), true);
  }
}

export class RootMessageModel<Data = any> {
  private key:string = ''
  private base: Base
  private type = Messager.Root

  constructor (key: string) {
    this.base = new Base(key)
    this.key = key
  }

  onMessage (callback: RootCallback<Data>) {
    chrome?.runtime?.onMessage.addListener((message: MessageData, sender: any, sendResponse) => {
      const messageType = message?.[this.base.flagKey]
      if (messageType) {
        const messageTypeJson = this.base.messageTypeParse(messageType)

        if (messageTypeJson.to === this.type && messageTypeJson.toKey === this.key) {
          callback(
            message.data,
            (data: Data) => {
              sendResponse({ data, [this.base.flagKey]: this.base.messageTypeReverse(messageType) })
            },
            {
              ...messageTypeJson,
              sender,
            },
          )
          return true
        }
      }
    })
  }
}

export class ContentMessageModel<Data = any> {
  private key:string = ''
  private onMessageCallback?: (message: Data, sendResponse: any, messager: MessagerData) => Promise<void>
  private base: Base
  private listenerMap: Record<RandomStr, (data: Data) => void> = {}
  private type = Messager.Content

  constructor (key: string, rootKey: string) {
    this.key = key
    this.base = new Base(rootKey)

    this.chromeListener = this.chromeListener.bind(this)
    this.windowMessager = this.windowMessager.bind(this)
    chrome.runtime.onMessage.addListener(this.chromeListener)
    window.addEventListener('message', this.windowMessager)
    this.onMessageCallback = async () => {}
  }

  onMessage (callback: ContentCallback<Data>) {
    this.onMessageCallback = (message, sendResponse, messager) => new Promise(async (resolve) => {
      await callback(message, sendResponse, messager)
      resolve()
    })
  }

  send (data: Data, pageKey?: string): Promise<void | Data> {
    const seed = this.base.random()
    const contentMessage = {
      from: this.type,
      fromKey: this.key,
      seed,
    }
    if (typeof pageKey === 'string') {
      this.postMessage(data, {
        ...contentMessage,
        to: Messager.Page,
        toKey: pageKey,
      })
    } else {
      this.sendMessage(data, {
        ...contentMessage,
        to: Messager.Root,
        toKey: this.base.rootKey,
      })
    }
    return new Promise(resolve => {
      this.listenerMap[seed] = (data: Data) => resolve(data)
    })
  }

  destroy() {
    window.removeEventListener('message', this.windowMessager)
    this.onMessageCallback = undefined
    this.send = async (data: Data, pageKey?: string) => console.error('>>> The instance has been destroyed.')
  }

  private chromeListener (message: MessageData, sender?: any, sendResponse?: any) {
    const messageType = message?.[this.base.flagKey]
    if (messageType) {
      const messageTypeJson = this.base.messageTypeParse(messageType)

      if (messageTypeJson.toKey === this.key && messageTypeJson.to === this.type || messageTypeJson.contents?.find(item => item.key === this.key && item.type === this.type)) {
        let isContinue = true
        this.onMessageCallback?.(
          message.data,
          (data: Data) => {
            isContinue = false
            sendResponse?.({
              data,
              [this.base.flagKey]: this.base.messageTypeReverse(messageType) 
            })
          },
          {
            ...messageTypeJson,
            sender,
          },
        ).then(() => {
          const listener = this.listenerMap[messageTypeJson.seed]
          if (listener) {
            listener(message.data)
            delete this.listenerMap[messageTypeJson.seed]
          }
          // root -> page 如果 content 的 onMessage 返回值不为 false 则转发到 page
          if (messageTypeJson.to === Messager.Page && isContinue) {
            this.postMessage(message.data, messageTypeJson)
          }
        })
        return true
      }
    }
  }

  private windowMessager (message: MessageEvent) {
    const messageType = message.data?.[this.base.flagKey]
    if (messageType) {
      const messageTypeJson = this.base.messageTypeParse(messageType)
      if (messageTypeJson.to === Messager.Page) return
      if (messageTypeJson.toKey === this.key || messageTypeJson.contents?.find(item => item.key === this.key)) {
        let isContinue = true
        this.onMessageCallback?.(
          message.data.data,
          (data: Data) => {
            isContinue = false
            this.postMessage(data, {
              from: this.type,
              fromKey: this.key,
              to: Messager.Page,
              toKey: messageTypeJson.fromKey,
              seed: messageTypeJson.seed,
            })
          },
          messageTypeJson,
        ).then(() => {
          const listener = this.listenerMap[messageTypeJson.seed]
          if (listener) {
            listener(message.data)
            delete this.listenerMap[messageTypeJson.seed]
          }
          // page -> root 如果 content 的 onMessage 返回值不为 false 则转发到 root
          if (messageTypeJson.to === Messager.Root && isContinue) {
            this.sendMessage(message.data.data, messageTypeJson)
          }
        })
      }
    }
  }

  private postMessage (data: Data, messageTypeJson: MessageTypeJSON) {
    window.postMessage({
      data,
      [this.base.flagKey]: this.base.messageTypeStringify(messageTypeJson),
    }, '*')
  }

  private sendMessage (data: Data, messageTypeJson: MessageTypeJSON) {
    chrome.runtime.sendMessage({
      data,
      [this.base.flagKey]: this.base.messageTypeStringify(messageTypeJson),
    }, this.chromeListener)
  }
}

export class PageMessageModal<Data = any> {
  private key: string
  private type = Messager.Page
  private contentKey: string
  private base: Base
  private onMessageCallback?: PageCallback<Data>
  private listenerMap: Record<RandomStr, (data: Data) => void> = {}

  constructor (key: string, contentKey: string, rootKey: string) {
    this.base = new Base(rootKey)
    this.key = key
    this.contentKey = contentKey

    this.messageEventListener = this.messageEventListener.bind(this)
    window.addEventListener('message', this.messageEventListener)
  }

  onMessage (callback: PageCallback<Data>) {
    this.onMessageCallback = callback
  }

  send (data: Data): Promise<void | Data> {
    const seed = this.base.random()
    window.postMessage({
      data,
      [this.base.flagKey]: this.base.messageTypeStringify({
        from: this.type,
        fromKey: this.key,
        to: Messager.Root,
        toKey: this.base.rootKey,
        contents: [
          { key: this.contentKey, type: Messager.Content },
        ],
        seed,
      }),
    }, '*')

    return new Promise((resolve) => {
      this.listenerMap[seed] = (data: Data) => resolve(data)
    })
  }

  destroy() {
    window.removeEventListener('message', this.messageEventListener)
    this.onMessageCallback = undefined
    this.listenerMap = {}
    this.send = async (data: Data) => console.error('>>> The instance has been destroyed.')
  }

  private async messageEventListener (message: MessageEvent) {
    const messageType = message.data?.[this.base.flagKey]
    if (messageType) {
      const messageTypeJson = this.base.messageTypeParse(messageType)
      if (messageTypeJson.toKey === this.key && messageTypeJson.to === this.type || (messageTypeJson.fromKey === this.contentKey && messageTypeJson.toKey === '')) {
        this.onMessageCallback?.(message.data.data, messageTypeJson)
        const listener = this.listenerMap[messageTypeJson.seed]
        if (listener) {
          listener(message.data.data)
          delete this.listenerMap[messageTypeJson.seed]
        }
      }
    } 
  }
}
