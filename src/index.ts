import { Router, Request, Response, NextFunction } from 'express'
import bodyParser from 'body-parser'
import { getMany, GetList, Search, FiltersOption } from './getList'
import { getOne, GetOne } from './getOne'
import { create, Create } from './create'
import { update, Update } from './update'
import { destroy, Destroy } from './delete'

export interface Actions<I extends string | number, R> {
  getOne: GetOne<R> | null
  create: Create<I, R> | null
  destroy: Destroy | null
  update: Update<R> | null
  getList: GetList<R> | null
  search: Search<R> | null
}

interface CrudOptions {
  filters: FiltersOption
}

export { sequelizeSearchFields } from './sequelize/searchList'
export { sequelizeCrud } from './sequelize'

export { GetOne, Create, Destroy, Update, GetList, Search }

export type AuthFunction = (req: Request, res: Response, next: NextFunction) => void

export const crud = <I extends string | number, R>(
  path: string,
  auth: AuthFunction,
  actions: Partial<Actions<I, R>>,
  options?: Partial<CrudOptions>
) => {
  const router = Router()
  router.use(bodyParser.json())

  if (actions.getList)
    router.get(
      path,
      auth,
      getMany(
        actions.getList,
        actions.search || undefined,
        options && options.filters
      )
    )

  if (actions.getOne) {
    router.get(`${path}/:id`, auth, getOne(actions.getOne))
  }

  if (actions.create) {
    router.post(path, auth, create(actions.create))
  }

  if (actions.update) {
    if (!actions.getOne) {
      throw new Error('You cannot define update without defining getOne')
    }
    router.put(`${path}/:id`, auth, update(actions.update, actions.getOne))
  }

  if (actions.destroy) {
    router.delete(`${path}/:id`, auth, destroy(actions.destroy))
  }

  return router
}

export default crud
