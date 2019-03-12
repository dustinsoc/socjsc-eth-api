const express = require('express');
const { transfer, getBalance, getConfirmedTransaction, generateAccount } = require('../bitcoin/services');

const bitcoinRouter = express.Router();

bitcoinRouter.post('/transfer', (req, res) => {
    const { privateKey, to, amount } = req.body;
    transfer(privateKey, to, amount)
    .then(result => res.send({ success: true, result }))
    .catch(error => res.status(400).send({ success: false, message: error.message }));
});

bitcoinRouter.get('/balance/:userAddress', (req, res) => {
    const { userAddress } = req.params;
    getBalance(userAddress)
    .then(result => res.send({ success: true, result }))
    .catch(error => res.status(400).send({ success: false, message: error.message }));
});

bitcoinRouter.get('/transaction/:txHash', (req, res) => {
    const { txHash } = req.params;
    getConfirmedTransaction(txHash)
    .then(result => res.send({ success: true, result }))
    .catch(error => res.status(400).send({ success: false, message: error.message }));
});

bitcoinRouter.get('/generate', (req, res) => {
    const result = generateAccount();
    res.send({ success: true, result });
});

module.exports = { bitcoinRouter };
