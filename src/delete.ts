import { RequestHandler, Request } from 'express'

export type Destroy = (req: Request, id: string) => Promise<any>

export const destroy = (doDestroy: Destroy): RequestHandler => async (
  req,
  res,
  next
) => {
  try {
    await doDestroy(req, req.params.id)
    res.json({ id: req.params.id })
  } catch (error) {
    next(error)
  }
}
