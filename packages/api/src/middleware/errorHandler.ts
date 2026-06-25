import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NotFoundError'
  }
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    res.status(422).json({ error: { message: 'Validation failed', issues: err.issues } })
    return
  }

  if (err instanceof NotFoundError) {
    res.status(404).json({ error: { message: err.message } })
    return
  }

  // Unexpected: log server-side and return a generic message
  console.error(err)
  res.status(500).json({ error: { message: 'Internal Server Error' } })
}
