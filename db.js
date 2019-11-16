import Sequelize from 'sequelize'
import HolidaysInit from './models/holidays'

const sequelize = new Sequelize(
	process.env.MYSQL_DB,
	process.env.MYSQL_USERNAME,
	process.env.MYSQL_PASSWORD,
	{
		host: process.env.MYSQL_HOST,
		dialect: 'mysql',
	}
)

const globalModelConfig = {
	timestamps: true,
}

const Holidays = HolidaysInit(sequelize, Sequelize, globalModelConfig)

sequelize.sync()

const getHolidays = () => new Promise(async (resolve, reject) => {
	Holidays.findAll()
		.then((holidays) => { // eslint-disable-line camelcase
			resolve(holidays)
		})
		.catch(err => reject(err))
})

const getHoliday = id => new Promise(async (resolve, reject) => {
	Holidays.findByPk(id)
		.then((holiday) => { // eslint-disable-line camelcase
			resolve(holiday)
		})
		.catch(err => reject(err))
})

const createHoliday = values => new Promise(async (resolve, reject) => {
	const objToInsert = Object.assign({}, values)

	Holidays.create(objToInsert)
		.then((result) => {
			resolve(result)
		})
		.catch((err) => {
			reject(err)
		})
})

const updateHoliday = (id, values) => new Promise(async (resolve, reject) => {
	const objToUpdate = Object.assign({}, values)

	Holidays.findByPk(id)
		.then((holiday) => { // eslint-disable-line camelcase
			if (!holiday) return reject(new Error('Holiday Not found')) // eslint-disable-line camelcase
			holiday.update(objToUpdate)
				.then((result) => {
					resolve(result)
				})
				.catch((err) => {
					reject(err)
				})
		})
})

const deleteHoliday = id => new Promise(async (resolve, reject) => {
	Holidays.findByPk(id)
		.then((holiday) => { // eslint-disable-line camelcase
			if (!holiday) return reject(new Error('Holiday Not found')) // eslint-disable-line camelcase
			holiday.destroy()
				.then((result) => {
					resolve(result)
				})
				.catch((err) => {
					reject(err)
				})
		})
})

export default {
	models: {
		Holidays
	},
	getHolidays,
	getHoliday,
	createHoliday,
	updateHoliday,
	deleteHoliday,
}
