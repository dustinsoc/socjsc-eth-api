const Web3 = require('web3');
const HDWalletProvider = require('truffle-hdwallet-provider');
const BigNumber = require('big-number');
const { INFURA_API } = require('../setting');
const { ABI } = require('./abi');
const { defaultWeb3 } = require('./get-default-web3');
const { mustBeAddress, mustBeNumber, makeSure } = require('./validators');

function toIntegerValue(value, decimals = 18) {
    const valueInteger = defaultWeb3.utils.toWei(value + '', 'ether');
    return new BigNumber(valueInteger).multiply(Math.pow(10, +decimals)).divide(1e18).toString();
}


async function transferToken(contractAddress, privateKey, to, tokens, gasPriceInGwei) {
    mustBeNumber(gasPriceInGwei);
    mustBeAddress(contractAddress);
    mustBeAddress(to);
    const gasPrice = (new BigNumber(gasPriceInGwei)).multiply(new BigNumber(1e9)).toString();
    const provider = new HDWalletProvider(privateKey, INFURA_API);
    const web3 = new Web3(provider);
    const erc20 = new web3.eth.Contract(ABI, contractAddress);
    const accounts = await web3.eth.getAccounts();
    const decimals = await erc20.methods.decimals().call();
    const gas = await erc20.methods.transfer(to, toIntegerValue(tokens, +decimals)).estimateGas({ from: accounts[0] });
    const txHash = await sendTransferTokenTransaction(erc20, to, toIntegerValue(tokens, +decimals), accounts[0]);
    return { gas, txHash };
}

async function getTransactionInfo(txHash) {
    const response = await defaultWeb3.eth.getTransactionReceipt(txHash);
    if (!response) throw Error('CANNOT_FIND_TX_HASH');
    return { ...response, mined: !!response };
}

async function getBalanceToken(contractAddress, userAddress) {
    mustBeAddress(contractAddress, 'INVALID_CONTRACT_ADDRESS');
    mustBeAddress(userAddress, 'INVALID_USER_ADDRESS');
    const erc20 = new defaultWeb3.eth.Contract(ABI, contractAddress);
    const balanceRespone = await erc20.methods.balanceOf(userAddress).call();
    const decimals = await erc20.methods.decimals().call();
    return { contractAddress, userAddress, balance: balanceRespone, decimals };
}

function sendTransferTokenTransaction (erc20, to, amount, account) {
    return new Promise((resolve, reject) => {
        erc20.methods.transfer(to, amount).send({ from: account })
        .on('transactionHash', hash => resolve(hash))
        .catch(error => reject(error));
    });
}

async function sendTransferEtherTransaction (web3, to, etherAmount, gasPriceInGwei) {
    const accounts = await web3.eth.getAccounts();
    const value = web3.utils.toWei(etherAmount + '', 'ether');
    const gasPrice = (new BigNumber(gasPriceInGwei)).multiply(new BigNumber(1e9)).toString();
    return new Promise((resolve, reject) => {
        web3.eth.sendTransaction({ from: accounts[0], to, value: toIntegerValue(etherAmount), gasLimit: 21000, gasPrice })
        .on('transactionHash', hash => resolve(hash))
        .catch(error => reject(error));
    });
}

async function transferEther(privateKey, to, etherAmount, gasPriceInGwei) {
    mustBeNumber(gasPriceInGwei);
    mustBeAddress(to);
    const provider = new HDWalletProvider(privateKey, INFURA_API);
    const web3 = new Web3(provider);
    const accounts = await web3.eth.getAccounts();
    const txHash = await sendTransferEtherTransaction(web3, to, etherAmount, gasPriceInGwei);
    return { txHash, from: accounts[0] };
}

async function getBalanceEther(address) {
    mustBeAddress(address);
    const balance = await defaultWeb3.eth.getBalance(address);
    return { balance, address };
}

async function getRandomEtherAccount() {
    return defaultWeb3.eth.accounts.create();
}

module.exports = {
    transferToken,
    sendTransferTokenTransaction,
    getTransactionInfo,
    getBalanceToken,
    transferEther,
    getBalanceEther,
    getRandomEtherAccount,
    toIntegerValue
};
