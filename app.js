const express = require('express');
const { json } = require('body-parser');
const { ethereumRouter, tokenRouter } = require('./routes/ethereum.route');
const { bitcoinRouter } = require('./routes/bitcoin.route');
const app = express();

app.use(json());

app.get('/', (req, res) => res.send({ success: true, message: 'OK' }));
app.use('/token', tokenRouter);
app.use('/ethereum', ethereumRouter);
app.use('/bitcoin', bitcoinRouter);

app.listen(process.env.PORT || 3000, () => console.log('Server started!'));
