import { MessageType, MessageModel } from '@/constants'
import { PageMessageModal } from 'crx-message'

(() => {
  console.log('>>> page script loaded')
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
})()