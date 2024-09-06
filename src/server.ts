import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { createConnection } from 'typeorm';
// import authRoutes from './routes/auth.routes';
// import appointmentRoutes from './routes/appointment.routes';

const app = express();

app.use(cors());
app.use(bodyParser.json());

// app.use('/auth', authRoutes);
// app.use('/appointments', appointmentRoutes);

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
})
