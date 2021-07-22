import { RequestHandler, Request } from 'express'
import { GetOne } from './getOne'

export type Update<R> = (req: Request, id: string, data: R) => Promise<any>

export const update = <R>(
  doUpdate: Update<R>,
  doGetOne: GetOne<R>
): RequestHandler => async (req, res, next) => {
  try {
    const record = await doGetOne(req, req.params.id)

    if (!record) {
      return res.status(404).json({ error: 'Record not found' })
    }

    res.json(await doUpdate(req, req.params.id, req.body))
  } catch (error) {
    next(error)
  }
}
