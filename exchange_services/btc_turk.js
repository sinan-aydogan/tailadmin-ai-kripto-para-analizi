import "dotenv/config"
import crypto from "crypto"

export default async function getBtcWallet() {
    const API_KEY = process.env.BTC_API_PUBLIC_KEY;
    const API_SECRET = process.env.BTC_API_SECRET_KEY

    const base = 'https://api.btcturk.com'
    const method = '/api/v1/users/balances'
    const uri = base + method;

    const options = { method: 'GET', headers: authentication() };

    let coins = {}

    const response = fetch(uri, options)
        .then(res => res.json())
        .then(json => {
            for (let i = 0; i < json.data.length; i++) {
                //if balance is greater than 0
                if ((Number(json.data[i].balance) > 0) && (json.data[i].asset !== 'TRY' ?? json.data[i].asset !== 'USDT')) {

                    let pair = json.data[i].asset + 'USDT'
                    let balance = json.data[i].balance

                    coins[pair] = balance
                }
            }
            console.log(coins)
        })
        .catch(err => console.error('error:' + err));


    function authentication() {
        const stamp = (new Date()).getTime()
        const data = Buffer.from(`${API_KEY}${stamp}`, 'utf8')
        const buffer = crypto.createHmac('sha256', Buffer.from(API_SECRET, 'base64'))
        buffer.update(data)
        const digest = buffer.digest()
        const signature = Buffer.from(digest.toString('base64'), 'utf8').toString('utf8')

        return {
            "Content-type": 'application/json',
            "X-PCK": API_KEY,
            "X-Stamp": stamp.toString(),
            "X-Signature": signature,
        }
    }


    return coins
}