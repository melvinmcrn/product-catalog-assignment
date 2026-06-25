import type { NextFunction, Request, Response } from 'express'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { errorHandler, NotFoundError } from './errorHandler'

const mockResponse = () => {
  const res = {} as Response
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res
}

const req = {} as Request
const next: NextFunction = vi.fn()

describe('errorHandler', () => {
  let res: Response

  beforeEach(() => {
    res = mockResponse()
  })

  describe('ZodError', () => {
    it('maps to 422 with a message and the issues array', () => {
      const zodError = z.object({ name: z.string() }).safeParse({}).error

      errorHandler(zodError, req, res, next)

      expect(res.status).toHaveBeenCalledWith(422)
      expect(res.json).toHaveBeenCalledWith({ error: { message: 'Validation failed', issues: expect.any(Array) } })
    })
  })

  describe('NotFoundError', () => {
    it('maps to 404 with its message', () => {
      errorHandler(new NotFoundError('No product 999'), req, res, next)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ error: { message: 'No product 999' } })
    })
  })

  describe('unexpected error', () => {
    beforeEach(() => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('maps to 500 with a generic message', () => {
      errorHandler(new Error('boom'), req, res, next)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ error: { message: 'Internal Server Error' } })
    })

    it('does not leak the internal error message to the client', () => {
      errorHandler(new Error('secret db connection string'), req, res, next)

      const payload = vi.mocked(res.json).mock.calls[0][0]
      expect(JSON.stringify(payload)).not.toContain('secret db connection string')
    })

    it('logs the error server-side', () => {
      errorHandler(new Error('boom'), req, res, next)

      expect(console.error).toHaveBeenCalled()
    })
  })
})
