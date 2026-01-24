import WebSocket from 'ws'
import { getRandomGuangxiIp } from './generate_guangxi_ips.mjs'
import { randomBytes } from 'node:crypto'

const referer = '175.178.29.106:8000'
const url = `ws://${referer}/ws`


const genHeaders = (ip) => ({
  'X-Forwarded-For': ip,
  referer: referer,
  host: referer,
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
})

const getSocket = (ip) => {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`${url}?fp=${randomBytes(16).toString('hex')}`, {
      headers: genHeaders(ip),
    })
    ws.on('open', () => {
      resolve(ws)
    })
    ws.on('error', (err) => {
      console.log('ws error', err)
      resolve(null)
    })
  })
}

let onlineCount = 0

async function startListenWs() {
  const listenWs = await getSocket(getRandomGuangxiIp())
  listenWs.on('message', (message) => {
    const data = JSON.parse(message.toString())
    const {type, count } = data
    if (['join', 'leave'].includes(type)) {
      onlineCount = count
      console.log('onlineCount', onlineCount)
    }
  })
}
startListenWs()


while (true) {
  if (onlineCount < 1000) {
    await getSocket(getRandomGuangxiIp())
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
}







