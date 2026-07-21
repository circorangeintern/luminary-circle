import { normalizePhone } from './phone.util';
import { AppException } from '../errors/app.exception';

describe('normalizePhone', () => {
  describe('valid inputs', () => {
    it.each([
      ['08031234567', '+2348031234567'],
      ['+2348031234567', '+2348031234567'],
      ['2348031234567', '+2348031234567'],
      ['8031234567', '+2348031234567'],
      ['0803 123 4567', '+2348031234567'],
      ['0803-123-4567', '+2348031234567'],
      ['(0803) 123 4567', '+2348031234567'],
      ['09161234567', '+2349161234567'],
      ['07051234567', '+2347051234567'],
    ])('normalizes %s to %s', (input, expected) => {
      expect(normalizePhone(input)).toBe(expected);
    });
  });

  describe('invalid inputs', () => {
    it.each([
      ['0803123456'],
      ['080312345678'],
      ['02031234567'],
      ['08631234567'],
      ['abcdefghijk'],
      [''],
      ['+1 555 123 4567'],
    ])('throws VALIDATION_ERROR for %s', (input) => {
      try {
        normalizePhone(input);
        fail('expected normalizePhone to throw');
      } catch (e) {
        expect(e).toBeInstanceOf(AppException);
        expect((e as AppException).code).toBe('VALIDATION_ERROR');
        expect((e as AppException).details?.[0]?.field).toBe('phone');
      }
    });
  });
});
