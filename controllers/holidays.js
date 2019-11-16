export default (container) => {
	const { db } = container

	return {

		getHolidays: (req, res) => {
			db.getHolidays().then((holidays) => {
				res.json({
					code: 0,
					holidays
				})
			}).catch((err) => {
				res.json({
					code: -1000,
					msg: err
				})
			})
		},

		getHoliday: (req, res) => {
			const { id } = req.params
			if (!id) {
				return res.status(400).json({ code: -1001 })
			}

			db.getHoliday(id)
				.then((holiday) => {
					res.json({
						code: 0,
						holiday
					})
				})
				.catch((err) => {
					res.json({
						code: -1000,
						msg: err
					})
				})
		},

		createHoliday: (req, res) => {
			if (!req.body.name) {
				return res.status(400).json({ code: -1001 })
			}

			new Promise((resolve, reject) => {
				db.createHoliday(req.body)
					.then(() => {
						resolve(true)
					})
					.catch(err => reject(err))
			})
				.then((creationComplete) => {
					if (creationComplete) {
						res.json({
							code: 0,
							message: 'New Holiday created successfully'
						})
					}
					else {
						res.json({
							code: -1000,
							message: 'Tech error'
						})
					}
				})
				.catch((error) => {
					res.json({
						code: -1000,
						message: error
					})
				})
		},

		updateHoliday: (req, res) => {
			const { id } = req.params
			if (!id || !req.body.name) {
				return res.status(400).json({ code: -1001 })
			}

			new Promise((resolve, reject) => {
				db.updateHoliday(id, req.body)
					.then(() => {
						resolve(true)
					})
					.catch(err => reject(err))
			})
				.then((creationComplete) => {
					if (creationComplete) {
						res.json({
							code: 0,
							message: 'Holiday updated successfully'
						})
					}
					else {
						res.json({
							code: -1000,
							message: 'Error'
						})
					}
				})
				.catch((error) => {
					res.json({
						code: -1000,
						message: error
					})
				})
		},

		deleteHoliday: (req, res) => {
			const { id } = req.params
			if (!id) {
				return res.status(400).json({ code: -1001 })
			}

			db.deleteHoliday(id)
				.then(() => {
					res.json({
						code: 0
					})
				})
				.catch((error) => {
					res.json({
						code: -1000,
						message: error.message
					})
				})
		}


	}
}
