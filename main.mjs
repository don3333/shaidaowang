import axios from "axios";
axios.defaults.withCredentials = true

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
          "password":"xx1234",
          "confirmPassword":"xx1234",
          verificationCode
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
      })
      console.log(`sendVerificationCode ${email} data`, data)
    } catch (error) {
      console.log(`sendVerificationCode ${email} error`, error)
    }
}


async function registerWithVerificationCode() {
  const {_token} = await genToken()
  const {email, cookie} =  await getEmailMessage({_token})
  await sendVerificationCode({email})
  const intervalId = setInterval(async () => {
    const {email, messages: [message]} =  await getEmailMessage({_token, cookie})
    if (message) {
      clearInterval(intervalId)
      const {content} = message
      const verificationCode = content.match(/<h2 style="font-size: 24px; font-weight: bold; text-align: center;">(.*?)<\/h2>/)[1]
      register({email, verificationCode})
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