import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { AppDataSource } from './data-source';

const app = express();

app.use(cors());
app.use(bodyParser.json());

AppDataSource.initialize()
.then(() => {
  console.log('Data Source has been initialized!')
  
  app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
  })

}).catch((error) => {
  console.log(error)
})

