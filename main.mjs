import WebSocket from 'ws'
import fs from 'node:fs'
import { getGuangxiIps } from './generate_guangxi_ips.mjs'
const ips = await getGuangxiIps(100)

const url = 'wss://api.chouxiang.cc.cd/'

const xiaoShuoText = fs.readFileSync('./品三国.txt', 'utf8')

const genHeaders = (ip) => ({
  'X-Forwarded-For': ip,
  referer: 'https://chouxiang.cc.cd',
  host: 'api.chouxiang.cc.cd',
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
})

const getSocket = (ip) => {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`${url}`, {
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

async function startListenWs() {
  const listenWs = await getSocket(ips[0])
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
    // ws.send(JSON.stringify({
    //   ip: ips[index],
    //   message: xiaoShuoText.slice(xiaoShuoIndex, nextXiaoShuoIndex),
    //   type: 'message',
    //   username: '广西用户'
    // }))
    setTimeout(() => {
      xiaoShuoIndex = nextXiaoShuoIndex
      sendMessage(index + 1)
    }, 1000)
  } catch (err) {
    sendMessage(index + 1)
  }
}

sendMessage()




