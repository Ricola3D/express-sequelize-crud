import { Model } from 'sequelize'
import { Actions } from '..'

export const sequelizeCrud = <I extends string | number, R extends Model>(
  model: R | { new (): R }
): Omit<Actions<I, R>, 'search'> => {
  const _model: any = model // TODO: how to correctly type this???
  return {
    create: async (req, res, body) => _model.create(body),
    update: async (req, res, id, body) => {
      const record = await _model.findByPk(id)
      if (!record) {
        throw new Error('Record not found')
      }
      return record.update(body)
    },
    getOne: async (req, res, id) => _model.findByPk(id),
    getList: async (req, res, { filter, limit, offset, order }) => {
      return _model.findAndCountAll({
        limit,
        offset,
        order,
        where: filter,
        raw: true,
      })
    },
    destroy: async (req, res, id) => {
      const record = await _model.findByPk(id)
      if (!record) {
        throw new Error('Record not found')
      }
      await record.destroy()
      return { id }
    },
  }
}
