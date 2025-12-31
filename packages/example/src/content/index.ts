import { MessageType, MessageModel } from '@/constants'
import { ContentMessageModel } from 'crx-message'

(() => {
  console.log('>>> content script loaded')
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
})()