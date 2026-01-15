import WebSocket from 'ws'
import fs from 'node:fs'
import { getGuangxiIps } from './generate_guangxi_ips.mjs'
const ips = await getGuangxiIps(5)

const url = 'ws://175.178.29.106:8000/ws'

const xiaoShuoText = fs.readFileSync('./品三国.txt', 'utf8')

const genHeaders = (ip) => ({
  'X-Forwarded-For': ip,
  referer: 'http://175.178.29.106',
  host: '175.178.29.106:8000',
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
})

const listenWs = new WebSocket('ws://175.178.29.106:8000/ws')

listenWs.on('open', () => {
  console.log('listenWs open')
})

listenWs.on('message', (message) => {
  console.log(message.toString())
})


const getSocket = (ip) => {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url, {
      headers: genHeaders(ip),
    })
    ws.on('open', () => {
      resolve(ws)
    })
    ws.on('error', (err) => {
      reject(err)
    })
  })
}


let xiaoShuoIndex = 0

async function sendMessage(index = 0) {
  const ip = ips[index]
  if (index >= ips.length) {
    sendMessage(0)
    return
  }
  try {
    const ws = await getSocket(ip)
      if (xiaoShuoIndex > xiaoShuoText.length) xiaoShuoIndex = 0
      const nextXiaoShuoIndex = xiaoShuoIndex + 150
      ws.send(JSON.stringify({
        ip,
        message: xiaoShuoText.slice(xiaoShuoIndex, nextXiaoShuoIndex),
        type: 'message',
        username: '广西用户'
      }))
      setTimeout(() => {
        ws.terminate()
        xiaoShuoIndex = nextXiaoShuoIndex
        sendMessage(index + 1)
      }, 500)
  } catch (err) {
    console.log(ip, err)
    sendMessage(index + 1)
  }
}

sendMessage()




