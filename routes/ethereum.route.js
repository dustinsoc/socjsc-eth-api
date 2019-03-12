const express = require('express');
const { transferToken, getBalanceToken, getTransactionInfo } = require('../ethereum/services');
const { transferEther, getBalanceEther, getRandomEtherAccount } = require('../ethereum/services');

const ethereumRouter = express.Router();
const tokenRouter = express.Router();

tokenRouter.post('/transfer', (req, res) => {
    const { contractAddress, privateKey, toAddress, tokens, gasPriceInGwei } = req.body;
    transferToken(contractAddress, privateKey, toAddress, tokens, gasPriceInGwei)
    .then(result => res.send({ success: true, result }))
    .catch(error => res.status(400).send({ success: false, message: error.message }));
});

tokenRouter.get('/balance/:contractAddress/:userAddress', (req, res) => {
    const { contractAddress, userAddress } = req.params;
    getBalanceToken(contractAddress, userAddress)
    .then(result => res.send({ success: true, result }))
    .catch(error => res.status(400).send({ success: false, message: error.message }));
});

ethereumRouter.get('/transaction/:txHash', (req, res) => {
    const { txHash } = req.params;
    getTransactionInfo(txHash)
    .then(result => res.send({ success: true, result }))
    .catch(error => res.status(400).send({ success: false, message: error.message }));
});

ethereumRouter.post('/transfer', (req, res) => {
    const { privateKey, to, etherAmount, gasPriceInGwei } = req.body;
    transferEther(privateKey, to, etherAmount, gasPriceInGwei)
    .then(result => res.send({ success: true, result }))
    .catch(error => res.status(400).send({ success: false, message: error.message }));
});

ethereumRouter.get('/balance/:userAddress', (req, res) => {
    getBalanceEther(req.params.userAddress)
    .then(result => res.send({ success: true, result }))
    .catch(error => res.status(400).send({ success: false, message: error.message }));
});

ethereumRouter.get('/generate', async (req, res) => {
    const result = await getRandomEtherAccount();
    res.send({ success: true, result });
});

module.exports = { ethereumRouter, tokenRouter };
