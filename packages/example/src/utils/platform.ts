import { PlatformType } from '@/constants';

export const platformConfigs = [
  {
    platforms: [PlatformType.YouTube],
    url: 'youtube.com',
  }, {
    platforms: [PlatformType.X],
    url: 'x.com',
  }, {
    platforms: [PlatformType.Facebook],
    url: 'www.facebook.com',
  }, {
    platforms: [PlatformType.FacebookBusiness, PlatformType.InstagramProfessional],
    url: 'business.facebook.com',
  }, {
    platforms: [PlatformType.TikTok, PlatformType.TikTokBusiness],
    url: 'tiktok.com',
  }, {
    platforms: [PlatformType.Instagram],
    url: 'instagram.com',
  }, {
    platforms: [PlatformType.LinkedIn],
    url: 'linkedin.com',
  }, {
    platforms: [PlatformType.Pinterest],
    url: 'pinterest.com',
  }, {
    platforms: [PlatformType.Threads],
    url: 'threads.com',
  },{
    platforms: [PlatformType.Reddit],
    url: 'reddit.com',
  },{
    platforms: [PlatformType.Xiaohongshu],
    url: 'xiaohongshu.com',
  },
]

export const getCurrentPlatform = (url?: string): null | PlatformType[] => {
  const targetUrl = url || window.location.hostname;
  for (const item of platformConfigs) {
    if (targetUrl.includes(item.url)) {
      return item.platforms
    }
  }
  return null;
};
