import { crud } from '../src'
import { setupApp } from './app'
import { User } from './User'

describe('crud', () => {
  const ctx = {
    server: null,
  }

  beforeEach(async () => {
    jest.resetAllMocks()
  })

  afterEach(() => {
    ctx.server.close()
  })

  describe('actions', () => {
    describe('GET_LIST', () => {
      it('calls getList with expected params when no "q" filter is provided', async () => {
        const getList = jest.fn()

        const dataProvider = await setupApp(
          crud('/users',
          (req, res, next) => next(),
          {
            getList,
          }),
          ctx
        )

        const rows = new Array(5).fill(1)
        const totalCount = 300

        getList.mockResolvedValue({
          count: totalCount,
          rows: rows as User[],
        })

        const response = await dataProvider.getList('users', {
          pagination: { page: 3, perPage: 5 },
          sort: { field: 'name', order: 'DESC' },
          filter: {},
        })

        expect(response.data).toEqual(rows)
        expect(response.total).toEqual(totalCount)
        expect(getList).toHaveBeenCalledWith(expect.anything(), {
          offset: 10,
          limit: 5,
          filter: {},
          order: [['name', 'DESC']],
        })
      })

      it('calls search with expected params when a "q" filter is provided', async () => {
        const search = jest.fn()

        const dataProvider = await setupApp(
          crud('/users',
          (req, res, next) => next(),
          {
            getList: jest.fn(),
            search,
          }),
          ctx
        )

        const rows = new Array(5).fill(1)
        const totalCount = 300

        search.mockResolvedValue({
          count: totalCount,
          rows: rows as User[],
        })

        const response = await dataProvider.getList('users', {
          pagination: { page: 0, perPage: 25 },
          sort: { field: 'id', order: 'DESC' },
          filter: { q: 'some search', language: 'en' },
        })
        expect(response.data).toEqual(rows)
        expect(response.total).toEqual(totalCount)
        expect(search).toHaveBeenCalledWith(expect.anything(), {
          q: 'some search',
          limit: 25,
          filter: {
            language: 'en',
          }
        })
      })
    })

    describe('DELETE', () => {
      it('calls destroy with expected params', async () => {
        const destroy = jest.fn()
        const dataProvider = await setupApp(
          crud('/users',
          (req, res, next) => next(),
          {
            destroy,
          }),
          ctx
        )

        const response = await dataProvider.delete('users', {
          id: 1,
        })

        expect(response.data).toEqual({ id: '1' })
        expect(destroy).toHaveBeenCalledWith(expect.anything(), '1')
      })
    })

    describe('UPDATE', () => {
      it('calls update with expected params', async () => {
        const getOne = jest.fn().mockResolvedValue({ id: 1, name: 'Éloi' })
        const update = jest.fn().mockResolvedValue({ id: 1, name: 'Éloi' })

        const dataProvider = await setupApp(
          crud('/users',
          (req, res, next) => next(),
          {
            getOne,
            update,
          }),
          ctx
        )

        const response = await dataProvider.update('users', {
          id: 1,
          data: {
            name: 'Éloi',
          },
        })

        expect(response.data).toEqual({ id: 1, name: 'Éloi' })
        expect(update).toHaveBeenCalledWith(expect.anything(), '1', { name: 'Éloi' })
      })

      it('throws if getOne is not defined', async () => {
        expect.assertions(1)

        const update = jest.fn().mockResolvedValue(null)

        try {
          await setupApp(
            crud('/users',
            (req, res, next) => next(),
            {
              update,
            }),
            ctx
          )
        } catch (error) {
          expect(error).toBeDefined()
        }
      })

      it('throws a 404 if record is not found', async () => {
        expect.assertions(1)

        const update = jest.fn()
        const getOne = jest.fn().mockResolvedValue(null)

        const dataProvider = await setupApp(
          crud('/users',
          (req, res, next) => next(),
          {
            getOne,
            update,
          }),
          ctx
        )

        try {
          await dataProvider.update('users', {
            id: 1,
            data: {
              name: 'Éloi',
            },
          })
        } catch (error) {
          expect(error.status).toEqual(404)
        }
      })
    })

    describe('CREATE', () => {
      it('calls create with expected params', async () => {
        const create = jest.fn().mockResolvedValue({ id: 1, name: 'Éloi' })
        const dataProvider = await setupApp(
          crud('/users',
          (req, res, next) => next(),
          {
            create,
          }),
          ctx
        )

        const response = await dataProvider.create('users', {
          data: {
            name: 'Éloi',
          },
        })

        expect(response.data).toEqual({ id: 1, name: 'Éloi' })
        expect(create).toHaveBeenCalledWith(expect.anything(), { name: 'Éloi' })
      })
    })

    describe('GET_ONE', () => {
      it('calls getOne with expected params', async () => {
        const getOne = jest.fn().mockResolvedValue({ id: 1, name: 'Éloi' })
        const dataProvider = await setupApp(
          crud('/users',
          (req, res, next) => next(),
          {
            getOne,
          }),
          ctx
        )

        const response = await dataProvider.getOne('users', {
          id: 1,
        })

        expect(response.data).toEqual({ id: 1, name: 'Éloi' })
        expect(getOne).toHaveBeenCalledWith(expect.anything(), '1')
      })

      it('throws a 404 when record is not found', async () => {
        expect.assertions(1)

        const getOne = jest.fn().mockResolvedValue(null)
        const dataProvider = await setupApp(
          crud('/users',
          (req, res, next) => next(),
          {
            getOne,
          }),
          ctx
        )

        try {
          await dataProvider.getOne('users', {
            id: 1,
          })
        } catch (error) {
          expect(error.status).toEqual(404)
        }
      })
    })
  })
})
