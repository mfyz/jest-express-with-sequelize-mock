import express from 'express'
import bodyParser from 'body-parser'
import request from 'supertest'

import db from '../db'
import routes from '../routes'

// Mock the overall database layer (connection etc..)
jest.mock('sequelize', () => require('./_mocks/sequelize'))

// Mock the User model with some test data and add both model method overrides
// and model instance overrides for our test assertations
jest.mock('../models/holidays', () => () => {
	const SequelizeMock = require('sequelize-mock')
	const dbMock = new SequelizeMock()
	const holidayMockModel = dbMock.define('holiday')
	
	const firstTestObject = holidayMockModel.build({
		id: 1,
		name: 'Test holiday #1',
		date: '2019-01-01 00:00:00',
		createdAt: '2019-01-01 00:00:00',
		updatedAt: '2019-01-01 00:00:00',
	})

	firstTestObject.update = (data) => {
		firstTestObject.isUpdated = true
		firstTestObject.name = data.name
		return Promise.resolve()
	}

	firstTestObject.destroy = () => {
		firstTestObject.isDestroyed = true
		return Promise.resolve()
	}

	const testModelInstances = [
		firstTestObject,
		holidayMockModel.build({
			id: 2,
			name: 'Test holiday #2',
			date: '2019-01-01 00:00:00',
			createdAt: '2019-01-01 00:00:00',
			updatedAt: '2019-01-01 00:00:00',
		})
	]

	// Mock model method overrides for tests below
	holidayMockModel.findAll = () => Promise.resolve(testModelInstances)
	holidayMockModel.findOne = (id) => Promise.resolve(id == 1 ? testModelInstances[0] : null)
	holidayMockModel.findByPk = (id) => Promise.resolve(id == 1 ? testModelInstances[0] : null)
	holidayMockModel.create = (data) => {
		testModelInstances.push(data)
		return Promise.resolve()
	}
	
	// Mock test helper methods
	holidayMockModel.mockHelperGetLastCreated = () => testModelInstances[testModelInstances.length - 1]
	holidayMockModel.mockHelperIsUpdateCalled = () => testModelInstances[0].isUpdated
	holidayMockModel.mockHelperIsDestroyCalled = () => testModelInstances[0].isDestroyed

	return holidayMockModel
})

describe('Holidays endpoints', () => {
	const app = express()
	app.use(bodyParser.json())
	app.use(routes({ db }))


	// Get list endpoint tests: POST /holidays/:id

	it('GET /holidays (list) should return code:0 and array of holidays', async (done) => {
		const res = await request(app)
			.get('/holidays')
			.expect('Content-Type', /json/)
			.expect(200)
		// console.log(res.body)
		expect(res.body.code).toEqual(0)
		expect(Array.isArray(res.body.holidays)).toBe(true)
		expect(res.body.holidays.length).toEqual(2)
		done()
	})


	// Get single endpoint tests: GET /holidays/:id

	it('GET /holidays/1 (single) should return code:0 and holiday object', async (done) => {
		const res = await request(app)
			.get('/holidays/1')
			.expect('Content-Type', /json/)
			.expect(200)
		// console.log(res.body)
		expect(res.body.code).toEqual(0)
		expect(typeof res.body.holiday).toEqual('object')
		expect(res.body.holiday.name).toEqual('Test holiday #1')
		done()
	})
	
	it('GET /holidays/123456 (single) should return no result for non-existent object id', async (done) => {
		const res = await request(app)
			.get('/holidays/123456')
			.expect('Content-Type', /json/)
			.expect(200)
		// console.log(res.body)
		expect(res.body.code).toEqual(0)
		expect(res.body.holiday).toBe(null)
		done()
	})


	// Create endpoint tests: POST /holidays

	it('POST /holidays (create) with missing info should fail', async (done) => {
		const res = await request(app)
			.post('/holidays')
			.send({})
			.expect('Content-Type', /json/)
			.expect(400)
		// console.log(res.body)
		expect(res.body.code).toEqual(-1001)
		done()
	})
	
	it('POST /holidays (create) should create new holiday record and return code:0', async (done) => {
		const res = await request(app)
			.post('/holidays')
			.send({
				name: 'New test holiday'
			})
			.expect('Content-Type', /json/)
			.expect(200)
		// console.log(res.body)
		expect(res.body.code).toEqual(0)

		// Check the mock database content for added row
		// using "Model.create" method called in the endpoint
		const lastCreatedObjectInMockDb = db.models.Holidays.mockHelperGetLastCreated()
		expect(lastCreatedObjectInMockDb.name).toEqual('New test holiday')

		done()
	})


	// Update endpoint tests: POST /holidays/:id

	it('POST /holidays/1 (update) with invalid info should fail', async (done) => {
		const res = await request(app)
			.post('/holidays/1')
			.send({  })
			.expect('Content-Type', /json/)
			.expect(400)
		// console.log(res.body)
		expect(res.body.code).toEqual(-1001)
		done()
	})
	
	it('POST /holidays/1 (update) should succeed and return code:0', async (done) => {
		const res = await request(app)
			.post('/holidays/1')
			.send({
				name: 'Updated holiday name for Test holiday #1'
			})
			.expect('Content-Type', /json/)
			.expect(200)
		// console.log(res.body)
		expect(res.body.code).toEqual(0)

		// Check the isUpdated flag of the object instance via mockDb helper method
		const isFirstTestObjectIsUpdated = db.models.Holidays.mockHelperIsUpdateCalled()
		expect(isFirstTestObjectIsUpdated).toBe(true)

		// Re-query the same object from api and check updated name
		const res2 = await request(app)
			.get('/holidays/1')
			.expect('Content-Type', /json/)
			.expect(200)
		// console.log(res.body)
		expect(res2.body.code).toEqual(0)
		expect(typeof res2.body.holiday).toEqual('object')
		expect(res2.body.holiday.name).toEqual('Updated holiday name for Test holiday #1')

		done()
	})


	// Delete endpoint tests: DELETE /holidays/:id

	it('DELETE /holidays with invalid info should fail', async (done) => {
		const res = await request(app)
			.delete('/holidays/1234')
			.expect('Content-Type', /json/)
			.expect(200)
		// console.log(res.body)
		expect(res.body.code).toEqual(-1000)
		done()
	})

	it('DELETE /holidays should succeed and return code:0', async (done) => {
		const res = await request(app)
			.delete('/holidays/1')
			.expect('Content-Type', /json/)
			.expect(200)
		// console.log(res.body)
		expect(res.body.code).toEqual(0)

		const isFirstTestObjectIsDestroyed = db.models.Holidays.mockHelperIsDestroyCalled()
		expect(isFirstTestObjectIsDestroyed).toBe(true)

		done()
	})

})
