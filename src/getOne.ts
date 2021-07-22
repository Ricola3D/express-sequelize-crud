import { RequestHandler, Request } from 'express'

export type GetOne<R> = (req: Request, identifier: string) => Promise<R | null>

export const getOne = <R>(doGetOne: GetOne<R>): RequestHandler => async (
  req,
  res,
  next
) => {
  try {
    const record = await doGetOne(req, req.params.id)

    if (!record) {
      return res.status(404).json({ error: 'Record not found' })
    }
    res.json(record)
  } catch (error) {
    next(error)
  }
}
