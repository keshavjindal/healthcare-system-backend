import express, { Express } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv'
import authRouter from './routes/authRoutes';
import userRouter from './routes/userRoutes'
import appointmentRouter from './routes/appointmentRoutes'
import { Request, Response, NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

dotenv.config()

const app: Express = express();

app.use(cors());
app.use(bodyParser.json());

const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


app.use('/auth', authRouter)
app.use('/users', userRouter)
app.use('/appointments', appointmentRouter)

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');  
})

