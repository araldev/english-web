import express from 'express'
import {AuthRouter} from '@/entry_point/api/auth/routes/authRouter'

const app = express()

app.use(express.json())

app.post('/auth', AuthRouter)

export default app