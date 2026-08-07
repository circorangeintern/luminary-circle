import { Test } from '@nestjs/testing'
import { AppException } from '../common/errors/app.exception'
import { AppConfigService } from '../config/app-config.service'
import { CaptchaService } from './captcha.service'

describe('CaptchaService', () => {
  let service: CaptchaService
  let fetchMock: jest.Mock

  beforeEach(async () => {
    fetchMock = jest.fn()
    global.fetch = fetchMock

    const module = await Test.createTestingModule({
      providers: [
        CaptchaService,
        {
          provide: AppConfigService,
          useValue: { turnstileSecretKey: 'test-secret' },
        },
      ],
    }).compile()

    service = module.get(CaptchaService)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('resolves silently when Cloudflare confirms the token', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    })

    await expect(service.verify('good-token')).resolves.toBeUndefined()
  })

  it('throws CAPTCHA_FAILED when Cloudflare rejects the token', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          success: false,
          'error-codes': ['invalid-input-response'],
        }),
    })

    await expect(service.verify('bad-token')).rejects.toMatchObject({
      code: 'CAPTCHA_FAILED',
    })
  })

  it('fails closed when the request to Cloudflare errors', async () => {
    fetchMock.mockRejectedValue(new Error('network down'))

    await expect(service.verify('any-token')).rejects.toMatchObject({
      code: 'CAPTCHA_FAILED',
    })
  })

  it('fails closed when Cloudflare returns a non-OK status', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 503 })

    await expect(service.verify('any-token')).rejects.toMatchObject({
      code: 'CAPTCHA_FAILED',
    })
  })

  it('never leaks Cloudflare error-codes to the thrown message', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          success: false,
          'error-codes': ['timeout-or-duplicate'],
        }),
    })

    try {
      await service.verify('bad-token')
      fail('expected verify to throw')
    } catch (e) {
      const message = (e as AppException).message
      expect(message).not.toContain('timeout-or-duplicate')
    }
  })
})
