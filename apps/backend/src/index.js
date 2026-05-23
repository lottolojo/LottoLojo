import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import authRouter from './auth.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);

app.get('/', (req, res) => {
  res.send('LottoLoJo backend werkt!');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend draait op http://localhost:${PORT}`);
});
