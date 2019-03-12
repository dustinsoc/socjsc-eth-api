require('./setting-up-btc');
const { PrivateKey } = require("bitcore-lib");
const bitcoinTransaction = require('bitcoin-transaction');
const request = require('superagent');

function transfer(privateKey, to, amount) {
    const privKeyObject = new PrivateKey(privateKey);
    return bitcoinTransaction.sendTransaction({
        from: privKeyObject.toAddress().toString(),
        to: to,
        privKeyWIF: privKeyObject.toWIF(),
        btc: +amount,
        network: 'mainnet',
        minConfirmations: 0
    });
}

async function getBalance(address) {
    const balance = await bitcoinTransaction.getBalance(address, { network: 'mainnet' });
    return { address, balance };
}

async function getConfirmedTransaction(txHash) {
    const currentBlockCount = await request.get('https://blockchain.info/q/getblockcount')
    .then(res => res.text);
    const transaction = await request.get(`https://blockchain.info/rawtx/${txHash}`)
    .then(res => res.body);
    return {
        txHash,
        isConfirmed: currentBlockCount - transaction.block_height >= 0,
        confirmations: currentBlockCount - transaction.block_height,
        ...transaction
    };
}

function generateAccount() {
    const privKey = new PrivateKey();
    const private = privKey.toString();
    return { private: privKey.toString(), address: privKey.toAddress().toString() };
}

module.exports = { transfer, getBalance, getConfirmedTransaction, generateAccount };
