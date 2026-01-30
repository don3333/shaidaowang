import axios from "axios";
import WebSocket from "ws";
import {randomUUID} from 'node:crypto'
axios.defaults.withCredentials = true
const password = 'xx1234'

const headers = {
  authority: 'api.saidao.cc',
  referer: 'https://saidao.cc/',
  origin: 'https://saidao.cc',
}
async function  getEmailMessage({
  _token,
  cookie,
}) {
  const {data, headers } = await axios.post(`https://tempmailg.com/get_messages`, {
    _token
  }, {
    headers: {
      Cookie: cookie,
    }
  })
  const {mailbox, messages} = data
  return {
    email: mailbox,
    messages,
    cookie: headers['set-cookie'].join('; '),
  }
}

async function register ({
  email,
  verificationCode,
}) {
  try {
    const {data} = await axios.post(`https://api.saidao.cc/user/register`, 
        {
          email,
          password,
          "confirmPassword": password,
          verificationCode
        },{
          headers
        }
    )
    if (data.code === '0') {
      console.log(`register ${email} success`)
    }
  } catch (error) {
  }
}


async function sendVerificationCode({
  email,
}) {
    try {
      const {data} = await axios.post(`https://api.saidao.cc/user/sendVerificationCode`, {
        email,
        scene: "register"
      }, {
        headers
      })
      console.log(`sendVerificationCode ${email} data`, data)
      return true
    } catch (error) {
      console.log(`sendVerificationCode ${email} error`, error)
      return false
    }
}

async function getToken({
  email,
  password
}) {
  const result = await axios.post(`https://api.saidao.cc/user/login`, {
    email,password
  }, {
    headers
  })
   const { token, user } = result.data
   return {
    token,
    user
   }
}


async function registerWithVerificationCode() {
  const {_token} = await genToken()
  const {email, cookie} =  await getEmailMessage({_token})
  console.log(email)
  const sendSuccess = await sendVerificationCode({email})
  if (!sendSuccess) {
    return
  }
  const intervalId = setInterval(async () => {
    const {email, messages: [message]} =  await getEmailMessage({_token, cookie})
    console.log(message)
    if (message) {
      clearInterval(intervalId)
      const {content} = message
      const verificationCode = content.match(/<h2 style="font-size: 24px; font-weight: bold; text-align: center;">(.*?)<\/h2>/)?.[1]
      if (verificationCode) {
        await register({email, verificationCode})
        const {token} = await getToken({email, password})
        console.log(token)
        const socket = new WebSocket(`wss://api.saidao.cc/ws/chat?token=${token}&fp=${randomUUID()}`)
        socket.on('open', () => {
          // console.log(message.toString())
          socket.send(JSON.stringify({
            type: 'chat',
            content:'测试',
          }))
        })
      }
    }
  }, 1000)
}

async function genToken () {
  const {data} = await axios.get(`https://tempmailg.com/`)
  const reg = /<meta name="csrf-token" content="(.*?)">/
  const csrfToken = reg.exec(data)[1]
  return {
    _token: csrfToken,
  }
}


while (true) {
  await new Promise(resolve => setTimeout(resolve, 1000))
  await registerWithVerificationCode()
}
