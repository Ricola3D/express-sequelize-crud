import { RequestHandler, Request, Response } from 'express'

export type GetOne<R> = (req: Request, res: Response, identifier: string) => Promise<R | null>

export const getOne = <R>(doGetOne: GetOne<R>): RequestHandler => async (
  req,
  res,
  next
) => {
  try {
    const record = await doGetOne(req, res, req.params.id)

    if (!record) {
      return res.status(404).json({ error: 'Record not found' })
    }
    res.json(record)
  } catch (error) {
    next(error)
  }
}
