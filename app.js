const express = require('express');
const app = express();
const http = require('http');
const cheerio = require('cheerio');
const got = require('got');

const server = http.createServer(app);
const {Server} = require("socket.io");
const io = new Server(server);

const URL = 'https://www.coingecko.com/en/coins/recently_added?page=1'
const store = {
    coinNames: [],
}
let socket;

app.use(express.static('public'))
init()
setInterval(getFreshData, 10000)

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socketLocal) => {
    console.log('a user connected');
    socket = socketLocal

});

server.listen(3000, () => {
    console.log('listening on *:3000');
});

function getFreshData() {
    got(URL).then(response => {
        const $ = cheerio.load(response.body);
        const requestCoins = []


        $('tbody').find('tr').each((i, el) => {
            const item = $(el).find('.coin-name').find('.tw-items-center')
            const coinName = item.text().trim()
            requestCoins.push(coinName)
        })

        let isNew = requestCoins.some(r => !store.coinNames.includes(r));
        if (isNew) {
            newCoinAlert()
            store.coinNames = requestCoins
            console.log(true)
        } else {
            console.log(false)
        }


    }).catch(err => {
        console.log(err);
    });
}

function init() {
    got(URL).then(response => {
        const $ = cheerio.load(response.body);
        const requestCoins = []


        $('tbody').find('tr').each((i, el) => {
            const item = $(el).find('.coin-name').find('.tw-items-center')
            const coinName = item.text().trim()
            requestCoins.push(coinName)
        })

        store.coinNames = requestCoins

    }).catch(err => {
        console.log(err);
    });
}

function newCoinAlert() {
    console.log('axali qoini daemata')
    socket.emit('newCurrency', true);
}
