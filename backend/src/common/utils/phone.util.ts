import { AppException } from '../errors/app.exception';

/**
 * Normalizes any common Nigerian mobile format to E.164 (+234XXXXXXXXXX).
 * Throw AppException(VALIDATION_ERROR) for anything that cannot be a
 * valid Nigerian mobile number.
 */
export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, '');

  let core: string;
  if (digits.length === 11 && digits.startsWith('0')) {
    core = digits.slice(1);
  } else if (digits.length === 13 && digits.startsWith('234')) {
    core = digits.slice(3);
  } else if (digits.length === 10) {
    core = digits;
  } else {
    throw invalidPhone('Phone number has an invalid length');
  }

  if (!/^[789][01]\d{8}/.test(core)) {
    throw invalidPhone('Not a valid Nigerian mobile number');
  }

  return `+234${core}`;
}

function invalidPhone(message: string): AppException {
  return new AppException('VALIDATION_ERROR', 'Invalid phone number', [
    { field: 'phone', message },
  ]);
}
