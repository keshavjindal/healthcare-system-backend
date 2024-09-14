import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv'
import authRouter from './routes/authRoutes';
import { Request, Response, NextFunction } from 'express';

dotenv.config()

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'An unexpected error occurred' });
});

app.use('/auth', authRouter)

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
})

