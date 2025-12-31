import { post } from '@/services/fetcher';

type Type = 'error' | 'debug' | 'info' | 'warn';
type Data = string | number | boolean | undefined | null | Record<string, any>;

export const loggerApi = async (params: { type: Type, data: Data[] }) => {
  // @ts-ignore
  const paramsData = [__BUILD_VERSION__, ...params.data];
  console.log(`>>> extension logger::${params.type}::`, ...paramsData);
  return post('/api/platform/logger', { type: params.type, data: paramsData });
};

export default function logger (...data: Data[]) {
  loggerApi({ type: 'info', data });
}
logger.info = (...data: Data[]) => loggerApi({ type: 'info', data });
logger.error = (...data: Data[]) => loggerApi({ type: 'error', data });
logger.warn = (...data: Data[]) => loggerApi({ type: 'warn', data });
logger.debug = (...data: Data[]) => loggerApi({ type: 'debug', data });