import { MessageModel, MessageType, PlatformGroupType, PlatformType } from '@/constants';
import { PageMessageModal } from '@/utils/message-event';

type Data = {
  platformType: PlatformType,
  platformGroupType: PlatformGroupType,
}
type LoginStatus = {
  userId: string,
} | null

let timerInterval: number | null = null;
let timerNum = 0;
export const useLoaded = async (platform: PlatformType, callback: (data: Data, sendLoginStatus: (status: LoginStatus) => Promise<void>) => void) => {
  const pageMessage = new PageMessageModal(platform, MessageModel.ContentPlatform, MessageModel.Root);
  const loadData = await pageMessage.send({ type: MessageType.PageScriptLoaded });
  const sendLoginStatus = (status: LoginStatus) => {
    // 轮询发送消息给 background 以保持活跃状态 避免休眠导致添加账号失败
    if (status?.userId) {
      clearInterval(timerInterval!);
      timerNum = 0;
      timerInterval = setInterval(() => {
        pageMessage.send({ type: MessageType.ConsoleLog, data: `[${platform}] 心跳保持活跃 ${++timerNum}` });
        if (timerNum > 20) {
          clearInterval(timerInterval!);
        }
      }, 20000);
    }

    return pageMessage.send({ type: MessageType.CheckLoginStatus, data: status });
  };

  // 防抖
  let timer: number | null = null;
  function debouncedScript(): void {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      callback(loadData, sendLoginStatus);
    }, 300)
  }

  window.addEventListener('load', () => debouncedScript());
  if (document.readyState === 'complete') {
    debouncedScript();
  }
  let currentUrl = window.location.href
  window.addEventListener('popstate', () => {
    setTimeout(() => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href
        debouncedScript();
      }
    }, 100)
  })

  // 拦截pushState和replaceState（SPA路由跳转）- 使用防抖
  const originalPushState = history.pushState
  const originalReplaceState = history.replaceState

  history.pushState = function (...args) {
    originalPushState.apply(this, args)
    setTimeout(() => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href
        debouncedScript();
      }
    }, 100)
  }

  history.replaceState = function (...args) {
    originalReplaceState.apply(this, args)
    setTimeout(() => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href
        debouncedScript();
      }
    }, 100)
  }
}