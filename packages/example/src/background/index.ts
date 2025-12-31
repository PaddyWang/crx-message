import { RootMessageModel } from 'crx-message'
import { MessageType, MessageModel, MessageData } from '@/constants';

const rootMessage = new RootMessageModel<MessageData>(MessageModel.Root);

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
