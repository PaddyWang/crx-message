# chrome 插件事件通信模型

简化页面脚本和 Background 的通信 统一处理消息  

通信模型: 自底向上传递  
`Page -> Content -> Background`  
每一条通信通道逻辑层面做了独立  保证了多个 Page/Content 互不干扰  

一共分了三个不同的类  
## RootMessageModel
Background 脚本事件模型类  

入参:
* `key`: 标记 Background 消息通道唯一值

实例方法:
* `onMessage`: `onMessage((message, sendResponse, messager) => void)`  消息监听函数
  - `message`: object  接收到消息
    - `type`: string  消息类型
    - `data`: any  消息体
  - `sendResponse`: (msg) => void  回复函数
    - `msg`: any 回复的消息
  - `messager`: object
    - `sender`: object chrome 原生 Sender 对象
    - `from`: Messager  消息来自哪里
    - `fromKey`: string  消息来自的唯一标记值
    - `to`: Messager  消息要到哪里
    - `toKey`: string  消息到的唯一标记值
    - `seed`: RandomStr  消息的随机种子
    - `contents?`: { type: Messager, key: string }[];  用于 Page 和 Background 通信时 保存中间 Content 的标记和类型

```js
const rootMessage = new RootMessageModel(MessageModel.Root);

rootMessage.onMessage(async (message, sendResponse) => {
  switch (message.type) {
    case MessageType.PageMessage:
      console.log('>>收到了来自 page 脚本的消息')
      break
    case MessageType.ContentMessage:
      console.log('>>收到了来自 content 脚本的消息')
      break
  }
  sendResponse('回复消息');
});
```


## ContentMessageModel
Content 脚本事件模型类  

入参:
* 第一个入参: 标记 Content 消息通道唯一值
* 第二个入参: 标记 Background 消息通道唯一值

实例方法:
* `onMessage`: `onMessage((message, sendResponse, messager) => void)`  消息监听函数
  - `message`: object  接收到消息
    - `type`: string  消息类型
    - `data`: any  消息体
  - `sendResponse`: (msg) => void  回复函数
    - `msg`: any 回复的消息
  - `messager`: object
    - `from`: Messager  消息来自哪里
    - `fromKey`: string  消息来自的唯一标记值
    - `to`: Messager  消息要到哪里
    - `toKey`: string  消息到的唯一标记值
    - `sender?`: object chrome 原生 Sender 对象
* `send`: `(data: Data, pageKey?: string): Promise<void | Data> `  发送消息给 Background 或 Page
  - `data`: 发送的消息体
  - `pageKey?`: 发送给页面脚本的唯一标记值(如果该值不存在则发送给 Background)
* `destroy`: `() => void`  销毁消息通信模型

```js
const contentMessage = new ContentMessageModel(MessageModel.Content, MessageModel.Root)

const type = MessageType.ContentMessage
const id = type
if (document.querySelector(`#${id}`)) return
const contentBtnEl = document.createElement('div')
contentBtnEl.id = id
contentBtnEl.addEventListener('click', async () => {
  console.log('>>> content send message')
  const ret = await contentMessage.send({ type })
  console.log('>>> content 收到回复：', ret)
});
contentBtnEl.innerHTML = `
  <style>
    #${id} {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 4px 8px;
      border-radius: 16px;
      background: rgba(212, 219, 255, 0.85);
      box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.04);
      z-index: 99999;
      cursor: pointer;
    }
  </style>
  <div class="tip">content 发送消息给 background</div>
`
document.documentElement.appendChild(contentBtnEl)
```

## PageMessageModal
Page 脚本事件模型类  

入参:
* 第一个入参: 标记 Page 消息通道唯一值
* 第二个入参: 标记 Content 消息通道唯一值
* 第三个入参: 标记 Background 消息通道唯一值

实例方法:
* `onMessage`: `onMessage((message, messageTypeJson) => void)`  消息监听函数
  - `message`: object  接收到消息
    - `type`: string  消息类型
    - `data`: any  消息体
  - `messageTypeJson`: (msg) => void  回复函数
    - `from`: Messager  消息来自哪里
    - `fromKey`: string  消息来自的唯一标记值
    - `to`: Messager  消息要到哪里
    - `toKey`: string  消息到的唯一标记值
    - `sender?`: object chrome 原生 Sender 对象
* `send`: `(data: Data): Promise<void | Data> `  发送消息给 Background 和 Content
  - `data`: 发送的消息体
* `destroy`: `() => void`  销毁消息通信模型

```js
const pageMessage = new PageMessageModal(MessageModel.Page, MessageModel.ContentPage, MessageModel.Root)

  const type = MessageType.PageMessage
  const id = type
  if (document.querySelector(`#${id}`)) return
  const contentBtnEl = document.createElement('div')
  contentBtnEl.id = id
  contentBtnEl.addEventListener('click', async () => {
    console.log('>>> page send message')
    const ret = await pageMessage.send({ type })
    console.log('>>> page 收到回复：', ret)
  })
  contentBtnEl.innerHTML = `
    <style>
      #${id} {
        position: fixed;
        top: 60px;
        right: 20px;
        padding: 4px 8px;
        border-radius: 16px;
        background: rgba(212, 219, 255, 0.85);
        box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.04);
        z-index: 99999;
        cursor: pointer;
      }
    </style>
    <div class="tip">content page 发送消息给 background</div>
  `
  document.documentElement.appendChild(contentBtnEl)
```