import express, { Express } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv'
import authRouter from './routes/authRoutes';
import userRouter from './routes/userRoutes'
import { Request, Response, NextFunction } from 'express';

dotenv.config()

const app: Express = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/auth', authRouter)
app.use('/users', userRouter)

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');  
})

