import { MessageModel, MessageData } from '@/constants'
import pageScript from './page?script&module'
import { ContentMessageModel } from 'crx-message'

(async () => {
  console.log('>>> content-page 加载了')
  if (document.getElementById(MessageModel.ContentPage)) return
  // 添加页面脚本
  const script = document.createElement('script')
  script.type = 'module'
  script.src = chrome.runtime.getURL(pageScript)
  script.id = MessageModel.ContentPage;
  (document.head || document.documentElement).appendChild(script)

  const contentMessage = new ContentMessageModel<MessageData>(MessageModel.ContentPage, MessageModel.Root)
  contentMessage.onMessage((message) => {
    console.log('>>> content-page message', message)
  })
})()
