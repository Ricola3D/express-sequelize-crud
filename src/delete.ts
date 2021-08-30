import { RequestHandler, Request, Response } from 'express'

export type Destroy = (req: Request, res: Response, id: string) => Promise<any>

export const destroy = (doDestroy: Destroy): RequestHandler => async (
  req,
  res,
  next
) => {
  try {
    await doDestroy(req, res, req.params.id)
    res.json({ id: req.params.id })
  } catch (error) {
    next(error)
  }
}
