import WebSocket from 'ws'
import fs from 'node:fs'
import { getGuangxiIps } from './generate_guangxi_ips.mjs'
const ips = await getGuangxiIps(50)

const url = 'ws://175.178.29.106:8000/ws'

const xiaoShuoText = fs.readFileSync('./品三国.txt', 'utf8')

const genHeaders = (ip) => ({
  'X-Forwarded-For': ip,
  referer: 'http://175.178.29.106',
  host: '175.178.29.106:8000',
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
})

const getSocket = (ip) => {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`${url}?fp=2fb373230878dcea9979482267c3738d`, {
      headers: genHeaders(ip),
    })
    ws.on('open', () => {
      resolve(ws)
    })
    ws.on('error', (err) => {
      resolve(null)
    })
  })
}

async function startListenWs() {
  const listenWs = await getSocket(ips[0])
  listenWs.on('open', () => {
    console.log('listenWs open')
  })
  listenWs.on('message', (message) => {
    console.log(message.toString())
  })
}

await startListenWs()




let socketList = await Promise.all(ips.map(ip => getSocket(ip)))
socketList = socketList.filter(ws => ws !== null)


let xiaoShuoIndex = 0

async function sendMessage(index = 0) {
  if (index >= socketList.length) {
    sendMessage(0)
    return
  }
  try {
    const ws = socketList[index]
    if (xiaoShuoIndex > xiaoShuoText.length) xiaoShuoIndex = 0
    const nextXiaoShuoIndex = xiaoShuoIndex + 150
    ws.send(JSON.stringify({
      ip: ips[index],
      message: xiaoShuoText.slice(xiaoShuoIndex, nextXiaoShuoIndex),
      type: 'message',
      username: '广西用户'
    }))
    setTimeout(() => {
      xiaoShuoIndex = nextXiaoShuoIndex
      sendMessage(index + 1)
    }, 1000)
  } catch (err) {
    sendMessage(index + 1)
  }
}

sendMessage()




