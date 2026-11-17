import { SolapiMessageService } from 'solapi';
import { logger } from './logger.js';

/**
 * SMS 서비스 - 솔라피 (Solapi) 연동
 * https://developers.solapi.com
 *
 * 필요한 환경변수:
 *   SOLAPI_API_KEY    - 솔라피 API 키
 *   SOLAPI_API_SECRET - 솔라피 API 시크릿
 *   SOLAPI_SENDER     - 발신 번호 (예: 01012345678)
 *
 * 환경변수가 없으면 개발 모드로 동작 (콘솔 출력 + 응답에 코드 포함)
 */

/**
 * 인증번호 SMS 발송
 * @returns true = 실제 SMS 발송, false = 개발 모드
 */
export async function sendVerificationSMS(phone: string, code: string): Promise<boolean> {
  const apiKey = process.env['SOLAPI_API_KEY'];
  const apiSecret = process.env['SOLAPI_API_SECRET'];
  const sender = process.env['SOLAPI_SENDER'];

  if (!apiKey || !apiSecret || !sender) {
    logger.info({ phone, code }, '[DEV] SMS not sent – Solapi env vars not set. Code logged here.');
    return false; // dev mode
  }

  const service = new SolapiMessageService(apiKey, apiSecret);

  await service.sendOne({
    to: phone.replace(/-/g, ''),
    from: sender,
    text: `[블렌딩] 인증번호는 ${code}입니다. 5분 이내에 입력해주세요.`,
  });

  logger.info({ phone }, 'SMS sent via Solapi');
  return true;
}
