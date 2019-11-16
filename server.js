import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'

import db from './db'
import routes from './routes'

const app = express()
const port = process.env.PORT || 3000
const container = { db }

const HolidaysController = HolidaysControllerInit(container)

app.use(bodyParser.json())
app.use(cors())

app.get('/', (req, res) => res.send('Hello World!'))

app.use(routes(container))

app.listen(port, () => console.log(`Express app listening on port ${port}!`))
