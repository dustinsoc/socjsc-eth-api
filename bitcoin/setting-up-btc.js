const bitcoinTransaction = require('bitcoin-transaction');
const request = require('superagent');

bitcoinTransaction.providers.balance.mainnet.default = function (addr) {
    return request.post('https://api.omniexplorer.info/v1/address/addr/')
    .set({ 'Content-Type': 'application/x-www-form-urlencoded' })
    .send({ addr })
    .then(res => {
        const listBalances = res.body.balance;
        const btcBalance = listBalances.find(b => b.symbol === 'BTC');
        return btcBalance.value;
    });
}

bitcoinTransaction.providers.utxo.mainnet.default = function (addr) {
    return request.get('https://blockchain.info/unspent?active=' + addr).send().then(function (res) {
        return res.body.unspent_outputs.map(function (e) {
            return {
                txid: e.tx_hash_big_endian,
                vout: e.tx_output_n,
                satoshis: e.value,
                confirmations: e.confirmations
            };
        });
    })
}

bitcoinTransaction.providers.pushtx.mainnet.default = function (signedTransaction) {
    return request.post('https://api.omniexplorer.info/v1/transaction/pushtx/')
    .set({ 'Content-Type': 'application/x-www-form-urlencoded' })
    .send({ signedTransaction })
    .then(res => res.body);
}
