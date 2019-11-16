import { Router } from 'express'

import HolidaysControllerInit from './controllers/holidays'

export default (container) => {
	const routes = Router()

	const HolidaysController = HolidaysControllerInit(container)

	routes.get('/holidays', HolidaysController.getHolidays)
	routes.get('/holidays/:id', HolidaysController.getHoliday)
	routes.post('/holidays', HolidaysController.createHoliday)
	routes.post('/holidays/:id', HolidaysController.updateHoliday)
	routes.delete('/holidays/:id', HolidaysController.deleteHoliday)

	return routes
}
