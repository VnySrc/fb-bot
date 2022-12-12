// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const puppeteer = require("puppeteer-extra")
//const pp = require("puppeteer")
//const UserAgent = require('user-agents')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const fs = require("fs")
const os = require("os")
const path = require("path")
const log4js = require("log4js")

log4js.configure({
  appenders: { everything: { type: 'file', filename: `${os.homedir().replaceAll(/\\/g, "/")}/Documents/fb-bot/logs.log`} },
  categories: { default: { appenders: ['everything'], level: 'ALL' } }
});
const logger = log4js.getLogger();

//const userAgent = new UserAgent({deviceCategory: "desktop"})

// div._2b04 > div._14v5 > div > div:nth-child(2)

function showAlert (text) {
        document.getElementById("alert-modal-content-id").innerHTML = `<span>${text}</span>`
        document.getElementById("alert-modal-id").style.visibility = "visible"
        document.getElementById("alert-modal-id").style.opacity = 1
        document.getElementById("alert-modal-id").style.zIndex = 999

        setTimeout(() => {
          document.getElementById("alert-modal-id").style.visibility = "hidden"
          document.getElementById("alert-modal-id").style.opacity = 1
          document.getElementById("alert-modal-id").style.zIndex = 0

        }, 3500)
}

const dir = `${os.homedir().replaceAll(/\\/g, "/")}/Documents/fb-bot`
const profilesFile = `${os.homedir().replaceAll(/\\/g, "/")}/Documents/fb-bot/profiles.json`
const cookiesPath = `${os.homedir().replaceAll(/\\/g, "/")}/Documents/fb-bot/cookies`
const profilesPath = `${os.homedir().replaceAll(/\\/g, "/")}/Documents/fb-bot/profiles`

function initFiles() {
  try {
if (!fs.existsSync(dir)) {
    //Efetua a criação do diretório
    fs.mkdirSync(dir);
    fs.mkdirSync(profilesPath)
    fs.mkdirSync(cookiesPath)
    fs.writeFileSync(profilesFile, [])
  }
  }catch (err) {
    consoleAndWriteOnLog(err)
    logger.debug(err)
  }
}
initFiles()

var browser
var commenQuantity = 0
var running = false
var waitDelay = false
var globalBrowser
var startedAt
var commentLink
var commentReplyesArray = ["Em contato", "Um minuto", "Responderemos em Breve"]
var commentedPhrases = []
var accountToUse
var lastAccountEmail = "sads"
var selectedProfile

function geraStringAleatoria(tamanho) {
    var stringAleatoria = '';
    var caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < tamanho; i++) {
        stringAleatoria += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return stringAleatoria;
}


function consoleAndWriteOnLog (consoleTxt) {
  if (!document.getElementById("console")) {
    console.log(consoleTxt)
    return
  }
  document.getElementById("console").innerHTML += `<br/> ${consoleTxt}`
  document.getElementById("console").scrollTo(0, document.body.scrollHeight)
  console.log(consoleTxt)
}

document.getElementById("link").addEventListener("input", (e) => {
  commentLink = e.target.value
})

async function startBot() {
    runBot()
}

var contasToParse
var pagesToParse
var pagesDir

var contas 
var pages 

var selectedQuantity = ""
var selectedPause = ""
const runBot = async (startedStatus) => {
try {
contasToParse = fs.readFileSync(`${os.homedir().replaceAll(/\\/g, "/")}/documents/fb-bot/profiles/${selectedProfile}/accounts.json`) // "C:/Users/vinyc/Documents/fb-bot/accounts.json"
pagesToParse = fs.readFileSync(`${os.homedir().replaceAll(/\\/g, "/")}/documents/fb-bot/profiles/${selectedProfile}/posts.json`)
pagesDir = `${os.homedir().replaceAll(/\\/g, "/")}/documents/fb-bot/profiles/${selectedProfile}/pages`

contas = JSON.parse(contasToParse)
pages = JSON.parse(pagesToParse)

selectedQuantity = document.getElementById("quantidade-respostas").value
selectedPause = document.getElementById("tempo-pausa").value

  if (!commentLink || commentLink === "" || selectedQuantity === "" || selectedPause === "") {
    document.getElementById("link").focus()
    document.getElementById("link").style.border = "1px solid black;"
    document.getElementById("link").style.borderColor = "red"

    document.getElementById("quantidade-respostas").style.border = "1px solid black;"
    document.getElementById("quantidade-respostas").style.borderColor = "red"

    document.getElementById("tempo-pausa").style.border = "1px solid black;"
    document.getElementById("tempo-pausa").style.borderColor = "red"

  setTimeout(() => {
      document.getElementById("link").style.borderColor = "black"
      document.getElementById("link").style.border = "1px solid black;"

      
      document.getElementById("quantidade-respostas").style.borderColor = "black"
      document.getElementById("quantidade-respostas").style.border = "1px solid black;"


      document.getElementById("tempo-pausa").style.borderColor = "black"
      document.getElementById("tempo-pausa").style.border = "1px solid black;"

  }, 1000)
    return
  }

  const selectedProfilePathToEdit = fs.readFileSync(`${os.homedir().replaceAll(/\\/g, "/")}/documents/fb-bot/profiles.json`)
  const selectedProfilePathToEdiParsed = JSON.parse(selectedProfilePathToEdit)
  const selectedProfileToEdit = selectedProfilePathToEdiParsed.find(profile => profile.nome === selectedProfile)
  const newToSave = selectedProfilePathToEdiParsed.filter(profile => profile.nome !== selectedProfile)

  selectedProfileToEdit.response = commentLink
  selectedProfileToEdit.runQuantity = selectedQuantity
  selectedProfileToEdit.delay = selectedPause
  newToSave.push(selectedProfileToEdit)

  fs.writeFileSync(`${os.homedir().replaceAll(/\\/g, "/")}/documents/fb-bot/profiles.json`, JSON.stringify(newToSave,  null, 4))

  // startedAt = new Date()
  // if (new Date().getDate() === new Date("2022/12/03").getDate()) {
  //   alert("Limite de inicializações de teste esxcedidas!")
  // }

  // setInterval(() => {
  //   if (startedAt.setMinutes(startedAt.getMinutes()) === startedAt.setMinutes(startedAt.getMinutes() + 1)) {
  //     alert("Tempo maximo de teste rodando bot atingido!")
  //     return
  //   }
  // }, 5000)

    if (running === true) {
      browser.close()
      document.getElementById("startBtn").style.backgroundColor = "green"
      document.getElementById("startBtn").innerHTML = "Iniciar"
      running = false
      return
      // running = false
    }else {
      running = true
    }

      console.table({
        running,
        waitDelay,
        commenQuantity,
      })
  
        if (running === true) {
    document.getElementById("startBtn").style.backgroundColor = "red"
    document.getElementById("startBtn").innerHTML = "Parar"
  } else {
    document.getElementById("startBtn").style.backgroundColor = "green"
    document.getElementById("startBtn").innerHTML = "Iniciar"
    browser.close()
    return
  }

    if (waitDelay) {
      await sleep(selectedPause * 60) //600
      waitDelay = false
      commenQuantity = 0
    }

    puppeteer.use(StealthPlugin())
    browser = await puppeteer.launch({
      headless: false,
      args: [
        //  '--user-agent='+userAgent.toString(),
        'disable-infobars',
        '--disable-infobars',
        '--start-minimized',
        '--disable-web-security',
        '--allow-file-access-from-files',
        '--window-size=800,600',
        '--window-posizition=200,0',
        '--disable-infobars',
      ],
      executablePath: path.join(__dirname, 'chrome-win', 'chrome.exe').replace("app.asar", "app.asar.unpacked")  //! "C:/Users/vinyc/Desktop/l/dist/win-unpacked/resources/app.asar.unpacked/chrome-win/chrome.exe"
    })
    
    globalBrowser = browser
    const page = await browser.newPage()
 
    // page.on('console', msg => console.log(msg.text()))
    page.on('console', async (msg) => {
      const msgArgs = msg.args();
      for (let i = 0; i < msgArgs.length; ++i) {
        console.log(await msgArgs[i].jsonValue());
      }
    });

    await page.exposeFunction('sleep', sleep);

    // await page.emulate(iPhone);
    var filtredContas
    filtredContas = contas.filter(conta => conta.status === "verifyed")  //! conta.email !== lastAccountEmail &&

    if (filtredContas.length === 0) {
      browser.close()
      document.getElementById("startBtn").style.backgroundColor = "green"
      document.getElementById("startBtn").innerHTML = "Iniciar"
      running = false
      showAlert("Sem contas verificadas para rodar o BOT!! favor clicar no botão Verificar, logar nas contas pelomenos 1 vez com o codigo de verificação para o BOT salvar os cookies") 
      return
    }
    accountToUse = filtredContas[betWin2(0, filtredContas.length - 1)]
    lastAccountEmail = accountToUse.email

    await setCookieSession(page, accountToUse.email)
    await sleep(5)

    await page.goto("https://www.facebook.com", { waitUntil: "load", timeout: 75000 })

    await sleep(3)

    try {
      await page.waitForSelector('#email', { timeout: 7000 })
      const accountsObjParse =  fs.readFileSync(`${os.homedir().replaceAll(/\\/g, "/")}/documents/fb-bot/profiles/${selectedProfile}/accounts.json`)
      const accountsObj = JSON.parse(accountsObjParse)
      const newAccounts = accountsObj.filter(account => account.email !== accountToUse.email)
      accountToUse.status = "unverify"
      newAccounts.push(accountToUse)

      fs.writeFileSync(`${os.homedir().replaceAll(/\\/g, "/")}/documents/fb-bot/profiles/${selectedProfile}/accounts.json`, JSON.stringify(newAccounts,  null, 4))
      showAlert("Cookies da conta não estão mais validos, verificar novamente")  //! alert
      browser.close()
      // document.getElementById("startBtn").style.backgroundColor = "green"
      // document.getElementById("startBtn").innerHTML = "Iniciar"
      running = false
      runBot()
      return
    }catch (err) {
      consoleAndWriteOnLog("Cookies da conta buscados com sucesso")
    }

    await sleep(2)

    const getCommentsResponse = await getComments(page)
    if (getCommentsResponse === false) {
      consoleAndWriteOnLog("Sem comentarios para editar neste post") //! alert
      commentedPhrases = []
      browser.close()
      running = false
      runBot()
      return
    }
    else if (getCommentsResponse === "sem-coments") {
      alert("Todos posts ja visitados, adiconar novos")  //! alert
      browser.close()
      document.getElementById("startBtn").style.backgroundColor = "green"
      document.getElementById("startBtn").innerHTML = "Iniciar"
      running = false
      return
    }

    await sleep(2)
    await editComments(page)
    browser.close()
    running = false
    runBot()

  } catch (err) {
    if (err.message.includes("timeout") || err.message.includes("launch") || err.message.includes("r1056772")) {
      document.getElementById("startBtn").style.backgroundColor = "red"
      document.getElementById("startBtn").innerHTML = "Parar"
      running = false
      runBot()
      return
    }else {
      document.getElementById("startBtn").style.backgroundColor = "green"
      document.getElementById("startBtn").innerHTML = "Iniciar"
      running = false
      consoleAndWriteOnLog(err)
      logger.debug(err)
      browser.close() 
      return
    }
    // runBot()
  }
}

function betWin2(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a }

async function login(page) {

  await page.waitForSelector('#email', { timeout: 5000 })
  // const accountToUse = contas[betWin2(0, contas.length - 1)]

  await page.evaluate(async (accountToUse) => {
    document.querySelector('#email').value = accountToUse.email
    document.querySelector('#pass').value = accountToUse.senha
    document.querySelector('button[type="submit"]').click()
  }, accountToUse)

  await sleep(2)
  await saveCookieSession(page, accountToUse.email)
}

async function getComments(page) {
  try {
    const postToUse = pages.find(postToVisit => postToVisit.status === "pending")
    if (!postToUse) {
      return "sem-coments"
    }
    await page.goto(postToUse.url, { waitUntil: "load", timeout: 55000 }) // 
    await sleep(2) 
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
    await sleep(3)
    const number = await page.evaluate(async () => {
      const comments = document.querySelectorAll(".x1n2onr6.x1iorvi4.x4uap5.x18d9i69.x1swvt13.x78zum5.x1q0g3np.x1a2a7pz") // comentario todo
      const commentArray = [...comments] // array de todos coments 
      return commentArray.length
    })

    let indexArray = []

    for (let index = 0; index < number; index++) {
      indexArray.push(index)
    }

    const shuffledIndexArray = shuffleArray(indexArray)

     let url

      try {
        url = page.url().split("posts/")[1].replaceAll("/", "")
      }catch {
        
      }

    if (typeof url === "undefined") {
      try {
        url = page.url().split("permalink/")[1].replaceAll("/", "")
      }catch {

      }
    }

    const fileExists = fs.existsSync(pagesDir)
    const fileExistsPage = fs.existsSync(`${pagesDir}/${url}.json`)
    if (!fileExists) {
      fs.mkdirSync(pagesDir)
    }
    if (!fileExistsPage) {
      fs.writeFileSync(`${pagesDir}/${url}.json`, JSON.stringify([]))
    }

    let postFile = fs.readFileSync(`${pagesDir}/${url}.json`, { encoding: 'utf8' })
    postFile = JSON.parse(postFile)
    
    let ypyp
    await page.exposeFunction('setCommentToReplyedList', (person, uniqueID) => {
      try {
        postFile.push({ person, uniqueID })
        ypyp = uniqueID
        commenQuantity = commenQuantity + 1

        if (commenQuantity >= selectedQuantity) {
          waitDelay = true
        }
      } catch (err) {
        consoleAndWriteOnLog(err)
        logger.debug(err)
      }
    });

    let selectedCommentData
    await page.exposeFunction('getSelectedCommentPersonAndPicture', (person, uniqueID, index) => {
      try {
        selectedCommentData = { person, uniqueID, index}
      } catch (err) {
        consoleAndWriteOnLog(err)
        logger.debug(err)
      }
    });

    try {
      await page.waitForSelector(".x1i10hfl.xjbqb8w.xjqpnuy.xa49m3k.xqeqjp1.x2hbi6w.x13fuv20.xu3j5b3.x1q0q8m5.x26u7qi.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xdl72j9.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x2lwn1j.xeuugli.xexx8yu.x18d9i69.xkhd6sd.x1n2onr6.x16tdsg8.x1hl2dhg.xggy1nq.x1ja2u2z.x1t137rt.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x3nfvp2.x1q0g3np.x87ps6o.x1a2a7pz.x6s0dn4.xi81zsa.x1iyjqo2.xs83m0k.xsyo7zv.xt0b8zv > .x78zum5.x1w0mnb.xeuugli", {timeout: 35000})
      let wileLimit = 0
      while (await page.waitForSelector(".x1i10hfl.xjbqb8w.xjqpnuy.xa49m3k.xqeqjp1.x2hbi6w.x13fuv20.xu3j5b3.x1q0q8m5.x26u7qi.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xdl72j9.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x2lwn1j.xeuugli.xexx8yu.x18d9i69.xkhd6sd.x1n2onr6.x16tdsg8.x1hl2dhg.xggy1nq.x1ja2u2z.x1t137rt.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x3nfvp2.x1q0g3np.x87ps6o.x1a2a7pz.x6s0dn4.xi81zsa.x1iyjqo2.xs83m0k.xsyo7zv.xt0b8zv > .x78zum5.x1w0mnb.xeuugli", {timeout: 5000}) && wileLimit < 7) {
        page.$eval(".x1i10hfl.xjbqb8w.xjqpnuy.xa49m3k.xqeqjp1.x2hbi6w.x13fuv20.xu3j5b3.x1q0q8m5.x26u7qi.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xdl72j9.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x2lwn1j.xeuugli.xexx8yu.x18d9i69.xkhd6sd.x1n2onr6.x16tdsg8.x1hl2dhg.xggy1nq.x1ja2u2z.x1t137rt.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x3nfvp2.x1q0g3np.x87ps6o.x1a2a7pz.x6s0dn4.xi81zsa.x1iyjqo2.xs83m0k.xsyo7zv.xt0b8zv > .x78zum5.x1w0mnb.xeuugli", btn => btn.click())
        await sleep(3) 
        wileLimit = wileLimit + 1
      }
    } catch (err) {
      consoleAndWriteOnLog("Sem botão mostrar mais")
    }
      window.scrollTo(0, document.body.scrollHeight);

    const newIndex = await page.evaluate(async (index, postFile) => {   // checar se comentario ja foi respondido / esta na lista doa rquivo json
      const comments = document.querySelectorAll(`.x1n2onr6.x1iorvi4.x4uap5.x18d9i69.x1swvt13.x78zum5.x1q0g3np.x1a2a7pz`)
      const setComment = new Set()
      const commentArray = [...comments].filter(i => {
        const uniqueIdArray = []
        Object.keys(postFile).forEach(post => {
          const selectedPost = postFile[post]
          uniqueIdArray.push(selectedPost.uniqueID)
        })

        const uniqueID = i.querySelector(".x1i10hfl.x1qjc9v5.xjbqb8w.xjqpnuy.xa49m3k.xqeqjp1.x2hbi6w.x13fuv20.xu3j5b3.x1q0q8m5.x26u7qi.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xdl72j9.x2lah0s.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x2lwn1j.xeuugli.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1n2onr6.x16tdsg8.x1hl2dhg.xggy1nq.x1ja2u2z.x1t137rt.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x1q0g3np.x87ps6o.x1lku1pv.x1rg5ohu.x1a2a7pz")

        return !uniqueIdArray.includes(uniqueID.getAttribute("href").split("user/")[1].split("/")[0])

      })

      return commentArray.length
    }, 1, postFile)

    consoleAndWriteOnLog("Quantidade de comentarios para responder neste post: " + newIndex)

    if (newIndex < 1) {
      const newPages = pages.filter(postToVisit => postToVisit.url !== postToUse.url)
      postToUse.status = "done"
      newPages.push(postToUse)

      fs.writeFileSync(`${os.homedir().replaceAll(/\\/g, "/")}/Documents/fb-bot/profiles/${selectedProfile}/posts.json`, JSON.stringify(newPages,  null, 4))
      return false
    }


    for (let index = 0; index < newIndex && commenQuantity < selectedQuantity; index++) {
      const shuflledIndex = shuffledIndexArray[index]

      await page.evaluate(async (index, postFile, page) => {   // checar se comentario ja foi respondido / esta na lista doa rquivo json
        const comments = document.querySelectorAll(`.x1n2onr6.x1iorvi4.x4uap5.x18d9i69.x1swvt13.x78zum5.x1q0g3np.x1a2a7pz`)
        const setComment = new Set()
        const commentArray = [...comments].filter(i => {
          const uniqueIdArray = []
          Object.keys(postFile).forEach(post => {
            const selectedPost = postFile[post]
            uniqueIdArray.push(selectedPost.uniqueID)
          })

          const uniqueID = i.querySelector(".x1i10hfl.x1qjc9v5.xjbqb8w.xjqpnuy.xa49m3k.xqeqjp1.x2hbi6w.x13fuv20.xu3j5b3.x1q0q8m5.x26u7qi.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xdl72j9.x2lah0s.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x2lwn1j.xeuugli.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1n2onr6.x16tdsg8.x1hl2dhg.xggy1nq.x1ja2u2z.x1t137rt.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x1q0g3np.x87ps6o.x1lku1pv.x1rg5ohu.x1a2a7pz")
          
          return !uniqueIdArray.includes(uniqueID.getAttribute("href").split("user/")[1].split("/")[0])

        })//.filter((post) => {
        //   const duplicatedPost = setComment.has(post.uniqueID);
        //   setComment.add(post.uniqueID);
        //   return !duplicatedPost;
        // });  // pegar sempre o index 0 e filtrar aqui pelo unique id tipo comentArrayFiltred. =comentArrayFiltred.filter(i => { i.getAttribute("aria-label")}) commentArray
        
        function betWin2(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a }
        const selectedCommentIndex = betWin2(0, commentArray.length - 1)
        const selecedComment = commentArray[selectedCommentIndex]
        let commentPersonName 

        try {
            page.waitForSelector(".x193iq5w.xeuugli.x13faqbe.x1vvkbs.x1xmvt09.x1lliihq.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.x4zkp8e.x676frb.x1nxh6w3.x1sibtaa.x1s688f.xzsf02u", {timeout: 5000})
            commentPersonName = selecedComment.querySelector(".x193iq5w.xeuugli.x13faqbe.x1vvkbs.x1xmvt09.x1lliihq.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.x4zkp8e.x676frb.x1nxh6w3.x1sibtaa.x1s688f.xzsf02u") // Nome da pessoa que comentou
        } catch {
          try {
            page.waitForSelector(".x193iq5w.xeuugli.x13faqbe.x1vvkbs.x1xmvt09.x1lliihq.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.x4zkp8e.x676frb.x1pg5gke.x1sibtaa.x1s688f.xzsf02u", {timeout: 5000})
            commentPersonName = selecedComment.querySelector(".x193iq5w.xeuugli.x13faqbe.x1vvkbs.x1xmvt09.x1lliihq.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.x4zkp8e.x676frb.x1pg5gke.x1sibtaa.x1s688f.xzsf02u") // Nome da pessoa que comentou
          }catch {
            commentPersonName = selecedComment.querySelector("span.x3nfvp2 > span.x193iq5w.xeuugli.x13faqbe")
          }
        }

      //  const commentPersonPicture = selecedComment.querySelector("i") // Nome da pessoa que comentou
        
        const uniqueID = selecedComment.querySelector(".x1i10hfl.x1qjc9v5.xjbqb8w.xjqpnuy.xa49m3k.xqeqjp1.x2hbi6w.x13fuv20.xu3j5b3.x1q0q8m5.x26u7qi.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xdl72j9.x2lah0s.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x2lwn1j.xeuugli.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1n2onr6.x16tdsg8.x1hl2dhg.xggy1nq.x1ja2u2z.x1t137rt.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x1q0g3np.x87ps6o.x1lku1pv.x1rg5ohu.x1a2a7pz")
        // const commentTag = selecedComment.querySelector(".xv78j7m.xt0e3qv")

        window.getSelectedCommentPersonAndPicture(commentPersonName.innerHTML, uniqueID.getAttribute("href").split("user/")[1].split("/")[0], selectedCommentIndex)

      }, shuflledIndex, postFile, page)

      const verify = postFile.find(comment => comment.person === selectedCommentData.person) // encontrar se tem um comment com nome da person

      if (verify && verify.uniqueID === selectedCommentData.uniqueID) { // verificar se existe o comentario na lista e checar se a foto bate
        consoleAndWriteOnLog("Verificando Comentarios")
      } else {
        await page.evaluate(async (index, postFile, selectedCommentData) => {
          const comments = document.querySelectorAll(`.x1n2onr6.x1iorvi4.x4uap5.x18d9i69.x1swvt13.x78zum5.x1q0g3np.x1a2a7pz`)
          const setComment = new Set()
          const commentArray = [...comments].filter(i => {
            const uniqueIdArray = []
            Object.keys(postFile).forEach(post => {
              const selectedPost = postFile[post]
              uniqueIdArray.push(selectedPost.uniqueID)
            })
            const uniqueID = i.querySelector(".x1i10hfl.x1qjc9v5.xjbqb8w.xjqpnuy.xa49m3k.xqeqjp1.x2hbi6w.x13fuv20.xu3j5b3.x1q0q8m5.x26u7qi.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xdl72j9.x2lah0s.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x2lwn1j.xeuugli.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1n2onr6.x16tdsg8.x1hl2dhg.xggy1nq.x1ja2u2z.x1t137rt.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x1q0g3np.x87ps6o.x1lku1pv.x1rg5ohu.x1a2a7pz")
            
            return !uniqueIdArray.includes(uniqueID.getAttribute("href").split("user/")[1].split("/")[0])
           })//.filter((post) => {
          //   const duplicatedPost = setComment.has(post.uniqueID);
          //   setComment.add(post.uniqueID);
          //   return !duplicatedPost;
          // });  // pegar sempre o index 0 e filtrar aqui pelo unique id tipo comentArrayFiltred. =comentArrayFiltred.filter(i => { i.getAttribute("aria-label")}) commentArray  // pegar sempre o index 0 e filtrar aqui pelo unique id tipo comentArrayFiltred. =comentArrayFiltred.filter(i => { i.getAttribute("aria-label")}) commentArray

          if (commentArray.length < 1) {
            return false
          }

          const selecedComment = commentArray[selectedCommentData.index]
          const commentActions = selecedComment.querySelector(`.x1n0m28w.x1rg5ohu.x1wfe3co.xat24cr.xsgj6o6.x1o1nzlu.xyqdw3p`) //container ações cometario  
          let commentPersonName 

          try {
              page.waitForSelector(".x193iq5w.xeuugli.x13faqbe.x1vvkbs.x1xmvt09.x1lliihq.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.x4zkp8e.x676frb.x1nxh6w3.x1sibtaa.x1s688f.xzsf02u", {timeout: 5000})
              commentPersonName = selecedComment.querySelector(".x193iq5w.xeuugli.x13faqbe.x1vvkbs.x1xmvt09.x1lliihq.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.x4zkp8e.x676frb.x1nxh6w3.x1sibtaa.x1s688f.xzsf02u") // Nome da pessoa que comentou
          } catch {
            try {
              page.waitForSelector(".x193iq5w.xeuugli.x13faqbe.x1vvkbs.x1xmvt09.x1lliihq.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.x4zkp8e.x676frb.x1pg5gke.x1sibtaa.x1s688f.xzsf02u", {timeout: 5000})
              commentPersonName = selecedComment.querySelector(".x193iq5w.xeuugli.x13faqbe.x1vvkbs.x1xmvt09.x1lliihq.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.x4zkp8e.x676frb.x1pg5gke.x1sibtaa.x1s688f.xzsf02u") // Nome da pessoa que comentou
            }catch {
              commentPersonName = selecedComment.querySelector("span.x3nfvp2 > span.x193iq5w.xeuugli.x13faqbe")
            }
          }
        //  const commentPersonPicture = selecedComment.querySelector("i") // Nome da pessoa que comentou
          const commentReply = commentActions.querySelector(".x1i10hfl.xjbqb8w.x6umtig.x1b1mbwd.xaqea5y.xav7gou.x9f619.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x16tdsg8.x1hl2dhg.xggy1nq.x1a2a7pz.xi81zsa.x1ypdohk.x1rg5ohu.x117nqv4.x1n2onr6.xt0b8zv") // botao responder //! document.querySelector("#mount_0_0_Jy > div > div:nth-child(1) > div > div.x9f619.x1n2onr6.x1ja2u2z > div > div > div > div.x78zum5.xdt5ytf.x10cihs4.x1t2pt76.x1n2onr6.x1ja2u2z > div.x78zum5.xdt5ytf.x1iyjqo2.x1us19tq > div > div.x9f619.x2lah0s.x1n2onr6.x78zum5.x1iyjqo2.x1t2pt76.x1lspesw > div > div > div.x78zum5.xdt5ytf.x1iyjqo2 > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div:nth-child(8) > div > div:nth-child(4) > div > div > div.x1jx94hy.x12nagc > ul > li:nth-child(1) > div.x1n2onr6 > div > div.x1r8uery.x1iyjqo2.x6ikm8r.x10wlt62.x1pi30zi > ul > li:nth-child(2) > div")
        function yy(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a }
          const uniqueID = selecedComment.querySelector(".x1i10hfl.x1qjc9v5.xjbqb8w.xjqpnuy.xa49m3k.xqeqjp1.x2hbi6w.x13fuv20.xu3j5b3.x1q0q8m5.x26u7qi.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xdl72j9.x2lah0s.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x2lwn1j.xeuugli.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1n2onr6.x16tdsg8.x1hl2dhg.xggy1nq.x1ja2u2z.x1t137rt.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x1q0g3np.x87ps6o.x1lku1pv.x1rg5ohu.x1a2a7pz")
          await sleep(yy(3, 7))
          commentReply.click({ delay: 5000 })

          // setTimeout(function () {
          //   commentReply.click({ delay: 2000 })
          // }, 1000);

          window.setCommentToReplyedList(commentPersonName.innerHTML, uniqueID.getAttribute("href").split("user/")[1].split("/")[0])

        }, shuflledIndex, postFile, selectedCommentData)

        await sleep(2)
        function yy(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a }
       
        consoleAndWriteOnLog("Respondendo comentario numero: " + selectedCommentData.index)
        consoleAndWriteOnLog("ID unico do comentario: " + ypyp) // ypyp
        const randomString = geraStringAleatoria(yy(5, 11))
        // await sleep(yy(2, 4))
        // await page.keyboard.down('ControlLeft')
        // await page.keyboard.press('KeyA')
        // await page.keyboard.press('KeyC')
        // await page.keyboard.up('ControlLeft')
        // await sleep(yy(2, 4))
        // await page.keyboard.press("Backspace")
        // await page.keyboard.press("Backspace")
        await sleep(yy(3, 7))
        page.keyboard.type(randomString)
        commentedPhrases.push(randomString)
        fs.writeFileSync(`${pagesDir}/${url}.json`, JSON.stringify(postFile, null, 4))
        // await sleep(yy(3, 9))
        //page.keyboard.press('Tab');
        await sleep(yy(3, 7))
         page.keyboard.press('Enter');
        await sleep(yy(5, 7))
      }

    }
    // fs.writeFileSync(`${url}.json`, JSON.stringify(postFile, null, 4))

  } catch (err) {
    consoleAndWriteOnLog(err.message)
    logger.debug(err)
    logger.debug(err.message)
    return false
  }
}

async function editComments(page) {
  try {
    await sleep(5)
    await page.waitForSelector(".x1n2onr6.x1iorvi4.x4uap5.x18d9i69.xurb0ha.x78zum5.x1q0g3np.x1a2a7pz", { timeout: 20000 })
    const replysBtns = await page.$$(".x1n2onr6.x1iorvi4.x4uap5.x18d9i69.xurb0ha.x78zum5.x1q0g3np.x1a2a7pz")
    const replysBtnsIndex = []
    const shuffledReplysBtnsIndex = shuffleArray(replysBtnsIndex)

    for (let i = 0; i < replysBtns.length; i++) {
      replysBtnsIndex.push(i)
    }

    consoleAndWriteOnLog("Quantidade de comentarios para verificar edição: " + replysBtns.length)
 function yy(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a }
    for (let i = 0; i < replysBtns.length; i++) {
        const index = shuffledReplysBtnsIndex[i]
        const element = replysBtns[index]
        let elementContent
        consoleAndWriteOnLog("Verifcando comentario numero: " + index)
        try {
          // await sleep(yy(1, 4))
          await page.waitForSelector(".x11i5rnm.xat24cr.x1mh8g0r.x1vvkbs.xdj266r > div", {timeout: 5000})
          elementContent = await element.$eval('.x11i5rnm.xat24cr.x1mh8g0r.x1vvkbs.xdj266r > div', el => el.textContent)
          console.log("Content --- " + elementContent)
        }catch (err) {
          consoleAndWriteOnLog(err)
          logger.debug(err)
          // await page.waitForSelector("div._2b04 > div._2b06 > div:nth-child(2)", {timeout: 5000}) 
          // elementContent = await element.$eval('div._2b04 > div._2b06 > div:nth-child(2)', el => el.textContent)
          consoleAndWriteOnLog("Verificando edições")
        }
        console.log("Content --- " + elementContent)

        if (elementContent && commentedPhrases.includes(elementContent.split(" ")[elementContent.split(" ").length - 1].trim())) {
          await sleep(yy(3, 7))
          consoleAndWriteOnLog("Editando comentario numero: " + index)
          await element.$eval('.x1i10hfl.x1qjc9v5.xjqpnuy.xa49m3k.xqeqjp1.x2hbi6w.x9f619.x1ypdohk.xdl72j9.x2lah0s.xe8uvvx.x2lwn1j.xeuugli.x16tdsg8.x1hl2dhg.xggy1nq.x1ja2u2z.x1t137rt.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x1q0g3np.x87ps6o.x1lku1pv.x1a2a7pz.xjyslct.xjbqb8w.x13fuv20.xu3j5b3.x1q0q8m5.x26u7qi.x972fbf.xcfux6l.x1qhh985.xm0m39n.x3nfvp2.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1n2onr6.x3ajldb.x194ut8o.x1vzenxt.xd7ygy7.xt298gk.x1xhcax0.x1s928wv.x10pfhc2.x1j6awrg.x1v53gu8.x1tfg27r.xitxdhh > i', el => el.click()) // x1r8uery.x1iyjqo2.x6ikm8r.x10wlt62.x1pi30zi > div > div:nth-child(2) > div > span > div > i data-sigil="comment-body" 
          await sleep(yy(2, 5)) //  x1ey2m1c.xds687c.xg01cxk.x47corl.x10l6tqk.x17qophe.x13vifvy.x1ebt8du.x19991ni.x1dhq9h.x1wpzbip.x14yjl9h.xudhj91.x18nykt9.xww2gxu
          await page.keyboard.press("Enter")
          await sleep(yy(2, 5))
          await page.keyboard.press("Backspace")
          await sleep(1)
          await page.keyboard.down('ControlLeft')
          // await page.keyboard.press('KeyA')
          await sleep(2)
          await page.keyboard.press("Backspace")
          await sleep(yy(3, 5))
          await page.keyboard.up('ControlLeft')
          // await page.keyboard.press("Backspace")
          // await page.keyboard.press("Backspace")
          await sleep(yy(5, 11))
          await page.keyboard.type(geraStringAleatoria(1) + " " + commentLink + " " + geraStringAleatoria(yy(1, 3)), {delay: 200}) 
          await sleep(yy(5, 11))
         await page.keyboard.press("Enter")
          // await page.keyboard.press("Escape")
          await sleep(yy(3, 7))
        }
    }
    consoleAndWriteOnLog("Edits terminados")
    return
  } catch (err) {
    console.error(err.message)
    logger.debug(err)
    // return "restart"
  }
}

function shuffleArray(arr) {
  // Loop em todos os elementos
  for (let i = arr.length - 1; i > 0; i--) {
    // Escolhendo elemento aleatório
    const j = Math.floor(Math.random() * (i + 1));
    // Reposicionando elemento
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // Retornando array com aleatoriedade
  return arr;
}

async function getPosts(page) {
  // document.querySelector("#mount_0_0_La > div > div:nth-child(1) > div > div.x9f619.x1n2onr6.x1ja2u2z > div > div > div > div.x78zum5.xdt5ytf.x10cihs4.x1t2pt76.x1n2onr6.x1ja2u2z > div.x9f619.x2lah0s.x1nhvcw1.x1qjc9v5.xozqiw3.x1q0g3np.x78zum5.x1iyjqo2.x1t2pt76.x1n2onr6.x1ja2u2z.x1h6rjhl > div.x9f619.x1n2onr6.x1ja2u2z.xdt5ytf.x193iq5w.xeuugli.x1r8uery.x1iyjqo2.xs83m0k.x78zum5.x1t2pt76 > div > div > div.x78zum5.xdt5ytf.x1iyjqo2 > div > div.x6s0dn4.x78zum5.xdt5ytf.xwib8y2.xh8yej3 > div > div > div > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div > div > div > div > div > div > div > div > div > div:nth-child(2) > div")
  return await page.evaluate(async () => {
    const result = document.querySelectorAll('post > div > header > div > div > div > div > h3 > span > strong:nth-child(3) > a')
    const resultArray = [...result]
    let array = []

    resultArray.forEach(element => {
      let title = element.innerHTML
      let index = parseInt(array.length) + 1
      let postElement = element
      array.push({ postElement, title, index })
    });
    return array
  })
}

async function showAllComments(page) {
  page.keyboard.press('Escape');
  page.keyboard.press('Escape');
  page.keyboard.press('Escape');
  await page.evaluate(async () => {
    // #mount_0_0_eU > div > div:nth-child(1) > div > div.x9f619.x1n2onr6.x1ja2u2z > div > div > div > div.x78zum5.xdt5ytf.x10cihs4.x1t2pt76.x1n2onr6.x1ja2u2z > div.x9f619.x2lah0s.x1nhvcw1.x1qjc9v5.xozqiw3.x1q0g3np.x78zum5.x1iyjqo2.x1t2pt76.x1n2onr6.x1ja2u2z.x1h6rjhl > div.x9f619.x1n2onr6.x1ja2u2z.xdt5ytf.x193iq5w.xeuugli.x1r8uery.x1iyjqo2.xs83m0k.x78zum5.x1t2pt76 > div > div > div.x78zum5.xdt5ytf.x1iyjqo2 > div > div.x6s0dn4.x78zum5.xdt5ytf.xwib8y2.xh8yej3 > div > div > div > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div > div > div > div > div > div > div > div > div > div:nth-child(2) > div > div:nth-child(4) > div > div > div.x1jx94hy.x12nagc > div:nth-child(3) > div.x78zum5.x1iyjqo2.x21xpn4.x1n2onr6 > div.x1i10hfl.xjbqb8w.xjqpnuy.xa49m3k.xqeqjp1.x2hbi6w.x13fuv20.xu3j5b3.x1q0q8m5.x26u7qi.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xdl72j9.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x2lwn1j.xeuugli.xexx8yu.x18d9i69.xkhd6sd.x1n2onr6.x16tdsg8.x1hl2dhg.xggy1nq.x1ja2u2z.x1t137rt.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x3nfvp2.x1q0g3np.x87ps6o.x1a2a7pz.x6s0dn4.xi81zsa.x1iyjqo2.xs83m0k.xsyo7zv.xt0b8zv
    window.scrollTo(0, 100)

    await new Promise((resolve, reject) => {
      setTimeout(function () {
        resolve()
      }, 5 * 1000)
    })

    //const posts = await getPosts()
    const commentBtns = document.querySelectorAll(".x78zum5.x1w0mnb.xeuugli > span")
    const commentBtnsArray = [...commentBtns]

    commentBtnsArray.forEach(async btn => {
      let options = { button: 'middle' };
      await btn.click()
    })
  })
}

async function sleep(sec) {
  return new Promise((resolve, reject) => {
    setTimeout(function () {
      resolve()
    }, sec * 1000)
  })
}
const timeoutReject = async (amount) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      return reject('TIMEOUT')
    }, amount)
  })
}


// startBot()

function saveAccount() {
  if (document.getElementById("email-input").value === "") return
  const accountsFile = fs.readFileSync(`${os.homedir().replaceAll(/\\/g, "/")}/Documents/fb-bot/profiles/${selectedProfile}/accounts.json`)
  const data = { email: document.getElementById("email-input").value, senha: document.getElementById("senha-input").value }
  data.id = new Date().getTime().toString()
  data.status = "unverify"

  const parsedFile = JSON.parse(accountsFile)
  parsedFile.push(data)
  fs.writeFileSync(`${os.homedir().replaceAll(/\\/g, "/")}/Documents/fb-bot/profiles/${selectedProfile}/accounts.json`, JSON.stringify(parsedFile, null, 4))

  document.getElementById("table-results").innerHTML = ""
  parsedFile.forEach(account => {
    document.getElementById("table-results").innerHTML += `
            <tr>
                <td>
                    <span class="custom-checkbox">
                        <input type="checkbox" class="checkbox-delete"  name="options[]" value=${account.id}>
                        <label for="checkbox1"></label>
                    </span>
                </td>
                <td>${account.email}</td>
                <td>${account.senha}</td>
            </tr>
            `
  });
  document.getElementById("email-input").value = ""
  document.getElementById("senha-input").value = ""
}
// saveAccount({email: "sadda", senha: "asdasd"})

function deleteAccount() {
  const accountFile = fs.readFileSync(`${os.homedir().replaceAll(/\\/g, "/")}/Documents/fb-bot/profiles/${selectedProfile}/accounts.json`)
  const parsedFile = JSON.parse(accountFile)

  if (document.getElementById("selectAll").checked === true) {
    fs.writeFileSync(`${os.homedir().replaceAll(/\\/g, "/")}/Documents/fb-bot/profiles/${selectedProfile}/accounts.json`, "[]")
    document.getElementById("table-results").innerHTML = ""
    const parsedFileNew = fs.readFileSync(`${os.homedir().replaceAll(/\\/g, "/")}/Documents/fb-bot/profiles/${selectedProfile}/accounts.json`)
    const parsedFileNewparsed = JSON.parse(parsedFileNew)
    parsedFileNewparsed.forEach(account => {
      document.getElementById("table-results").innerHTML += `
            <tr>
                <td>
                    <span class="custom-checkbox">
                        <input type="checkbox"      class="checkbox-delete"  name="options[]" value=${account.id}>
                          <label for="checkbox1"></label>
                    </span>
                </td>
                <td>${account.email}</td>
                <td>${account.senha}</td>
            </tr>
            `
    });
    
    document.getElementById('email-input').value = ""
    document.getElementById('senha-input').value = ""
    return
  }

  const checkedArray = document.querySelectorAll(".checkbox-delete")
  const idsToDeleteArray = []
  checkedArray.forEach(checkbox => {
    if (checkbox.checked === true) {
      idsToDeleteArray.push(checkbox.value)
    }
  })
  const newFile = parsedFile.filter(account => !idsToDeleteArray.includes(account.id))
  fs.writeFileSync(`${os.homedir().replaceAll(/\\/g, "/")}/Documents/fb-bot/profiles/${selectedProfile}/accounts.json`, JSON.stringify(newFile, null, 4),)

  document.getElementById("table-results").innerHTML = ""
  newFile.forEach(account => {
    document.getElementById("table-results").innerHTML += `
            <tr>
                <td>
                    <span class="custom-checkbox">
                        <input type="checkbox" class="checkbox-delete"  name="options[]" value=${account.id}>
                        <label for="checkbox1"></label>
                    </span>
                </td>
                <td>${account.email}</td>
                <td>${account.senha}</td>
            </tr>
            `
  });
    document.getElementById('email-input').value = ""
    document.getElementById('senha-input').value = ""
}

function savePost() {
  if (document.getElementById('url-input').value === "") return
  const postsFile = fs.readFileSync(`${os.homedir().replaceAll(/\\/g, "/")}/Documents/fb-bot/profiles/${selectedProfile}/posts.json`)
  data = { url: document.getElementById('url-input').value }
  data.id = new Date().getTime().toString()
  data.status = "pending"

  const parsedFile = JSON.parse(postsFile)
  parsedFile.push(data)
  fs.writeFileSync(`${os.homedir().replaceAll(/\\/g, "/")}/Documents/fb-bot/profiles/${selectedProfile}/posts.json`, JSON.stringify(parsedFile, null, 4),)

  document.getElementById("table-results").innerHTML = ""
  parsedFile.forEach(post => {
    document.getElementById("table-results").innerHTML += `
              <tr>
                <td>
                    <span class="custom-checkbox">
                        <input type="checkbox" class="checkbox-delete"  name="options[]" value=${post.id}>
                        <label for="checkbox1"></label>
                    </span>
                </td>
                <td>${post.url}</td>
                <td>${post.status}</td>
                <td><button class="pending-btns" value="${post.id}" onclick="setPending(${post.id})"> Pendente <button></td>
            </tr>
            `
  });
  document.getElementById('url-input').value = ""
}


function deletePost() {
  const postsFile = fs.readFileSync(`${os.homedir().replaceAll(/\\/g, "/")}/Documents/fb-bot/profiles/${selectedProfile}/posts.json`)
  const parsedFile = JSON.parse(postsFile)

  if (document.getElementById("selectAll").checked === true) {
    fs.writeFileSync(`${os.homedir().replaceAll(/\\/g, "/")}/Documents/fb-bot/profiles/${selectedProfile}/posts.json`, "[]")
    document.getElementById("table-results").innerHTML = ""
    const parsedFileNew = fs.readFileSync(`${os.homedir().replaceAll(/\\/g, "/")}/Documents/fb-bot/profiles/${selectedProfile}/posts.json`)
    const parsedFileNewparsed = JSON.parse(parsedFileNew)
    parsedFileNewparsed.forEach(post => {
      document.getElementById("table-results").innerHTML += `
              <tr>
                <td>
                    <span class="custom-checkbox">
                        <input type="checkbox" class="checkbox-delete"  name="options[]" value=${post.id}>
                        <label for="checkbox1"></label>
                    </span>
                </td>
                <td>${post.url}</td>
                <td>${post.status}</td>
                <td><button class="pending-btns" value="${post.id}" onclick="setPending(${post.id})"> Pendente <button></td>
            </tr>
            `
    });
    document.getElementById('url-input').value = ""
    return
  }

  const checkedArray = document.querySelectorAll(".checkbox-delete")
  const idsToDeleteArray = []
  checkedArray.forEach(checkbox => {
    if (checkbox.checked === true) {
      idsToDeleteArray.push(checkbox.value)
    }
  })

  const newFile = parsedFile.filter(account => !idsToDeleteArray.includes(account.id))

  fs.writeFileSync(`${os.homedir().replaceAll(/\\/g, "/")}/Documents/fb-bot/profiles/${selectedProfile}/posts.json`, JSON.stringify(newFile, null, 4),)

  document.getElementById("table-results").innerHTML = ""
  newFile.forEach(post => {
    document.getElementById("table-results").innerHTML += `
              <tr>
                <td>
                    <span class="custom-checkbox">
                        <input type="checkbox" class="checkbox-delete"  name="options[]" value=${post.id}>
                        <label for="checkbox1"></label>
                    </span>
                </td>
                <td>${post.url}</td>
                <td>${post.status}</td>
                <td><button class="pending-btns" value="${post.id}" onclick="setPending(${post.id})"> Pendente <button></td>
            </tr>
            `
  });
  document.getElementById('url-input').value = ""
}

function getAllAccounts() {
  const ppp = require("path")
  const accountsFile = fs.readFileSync(`${os.homedir().replaceAll(/\\/g, "/")}/Documents/fb-bot/profiles/${selectedProfile}/accounts.json`)
  const parsedFile = JSON.parse(accountsFile)

  return parsedFile
}

function getAllPosts() {
  const ppp = require("path")
  const postsFile = fs.readFileSync(`${os.homedir().replaceAll(/\\/g, "/")}/Documents/fb-bot/profiles/${selectedProfile}/posts.json`)
  const parsedFile = JSON.parse(postsFile)

  const toReturn = parsedFile.sort((a, b) => {
    if (a.status == "pending") return -1
    if (a.status == "done") return 1
    return 0
  })
  return toReturn
}
var tempBrowser
async function verifyEmails () {
  try {
    if (tempBrowser && running === true) {
      tempBrowser.close()
      tempBrowser = false
      return
    }
    if (running === true) {
      document.getElementById("verificar").style.backgroundColor = "green"
    document.getElementById("verificar").innerHTML = "Verificar"
    try {
      tempBrowser.close()
    }catch {
      return
    }
    return
      // running = false
    }else {
      running = true
    }

     if (running === true) {
  document.getElementById("verificar").style.backgroundColor = "red"
  document.getElementById("verificar").innerHTML = "Parar"
} else {
  document.getElementById("verificar").style.backgroundColor = "green"
  document.getElementById("verificar").innerHTML = "Verificar"
}

    const accountsObjParse =  fs.readFileSync(`${os.homedir().replaceAll(/\\/g, "/")}/documents/fb-bot/profiles/${selectedProfile}/accounts.json`)
    const accountsObj = JSON.parse(accountsObjParse)
    const accountsToVerifyFiltred = accountsObj.filter(email => email.status === "unverify")
  if (accountsToVerifyFiltred.length === 0) {
    document.getElementById("verificar").style.backgroundColor = "green"
    document.getElementById("verificar").innerHTML = "Verificar"
    running = false
    showAlert("Sem e-mails para verificar")
  }
    for (const verify of accountsToVerifyFiltred) {
      tempBrowser = await puppeteer.launch({
        headless: false,
        args: [
          //  '--user-agent='+userAgent.toString(),
          'disable-infobars',
          '--disable-infobars',
          '--start-minimized',
          '--disable-web-security',
          '--allow-file-access-from-files',
          '--window-size=800,600',
          '--window-posizition=200,0',
          '--disable-infobars',
        ],
        executablePath: path.join(__dirname, 'chrome-win', 'chrome.exe').replace("app.asar", "app.asar.unpacked") //! "C:/Users/vinyc/Desktop/l/dist/win-unpacked/resources/app.asar.unpacked/chrome-win/chrome.exe"
      })
      const page = await tempBrowser.newPage()      

      await page.goto("https://www.facebook.com", { waitUntil: "load", timeout: 55000 })

      await sleep(3)

      await page.waitForSelector('#email', { timeout: 15000 })
      // const accountToUse = contas[betWin2(0, contas.length - 1)]
    
      await page.evaluate(async (accountToUse) => {
        document.querySelector('#email').value = accountToUse.email
        document.querySelector('#pass').value = accountToUse.senha
        document.querySelector('button[type="submit"]').click()
      }, verify)
    
      // await page.waitForSelector(".")
      await page.waitForSelector(".x9f619.x1n2onr6.x1ja2u2z.x78zum5.x2lah0s.x1nhvcw1.x1qjc9v5.xozqiw3.x1q0g3np.x1pi30zi.x1swvt13.x4cne27.xifccgj", {timeout: 900000})
      await saveCookieSession(page, verify.email)
      await sleep(2)
                            
      const newAccounts = accountsObj.filter(account => account.email !== verify.email)
      verify.status = "verifyed"
      newAccounts.push(verify)

      fs.writeFileSync(`${os.homedir().replaceAll(/\\/g, "/")}/documents/fb-bot/profiles/${selectedProfile}/accounts.json`, JSON.stringify(newAccounts,  null, 4))

      document.getElementById("verificar").style.backgroundColor = "green"
      document.getElementById("verificar").innerHTML = "Verificar"
      tempBrowser.close()
      running = false

      if (document.getElementById("emails-content")) {
        const accountsObjParse1 =  fs.readFileSync(`${os.homedir().replaceAll(/\\/g, "/")}/documents/fb-bot/profiles/${selectedProfile}/accounts.json`)
    const accountsObj1 = JSON.parse(accountsObjParse1)
        document.getElementById("emails-content").innerHTML = `
        <tr  style="width:100%;">
  <th>Email</th>
  <th>Senha</th>
  <th>Status</th>
</tr>`

accountsObj1.forEach(conta => {
            document.getElementById("emails-content").innerHTML += `
            <tr>
                  <td>${conta.email}</td>
                  <td>${conta.senha}</td>
                  <td>${conta.status}</td>
                </tr>
            `
            // <div class="flex-emails-content"><span>${conta.email}</span> <span>${conta.status}</span></div>
        })
      }
    }

    
    
  }catch (err) {
    consoleAndWriteOnLog(err)
    logger.debug(err)
    document.getElementById("verificar").style.backgroundColor = "green"
    document.getElementById("verificar").innerHTML = "Verificar"
    running = false
    if (tempBrowser && running === true) {
      tempBrowser.close()
    }
    showAlert("Sem e-mails para verificar")
  }
}



const saveCookieSession = async (page, id) => {
  const p = `${os.homedir().replaceAll(/\\/g, "/")}/Documents/fb-bot/profiles/${selectedProfile}/cookies`

  if (!fs.existsSync(p)) {
    fs.mkdirSync(p)
  }

  const filePath = `${os.homedir().replaceAll(/\\/g, "/")}/Documents/fb-bot/profiles/${selectedProfile}/cookies/${id}.json`

  const cookies = await page.cookies()
  fs.writeFileSync(filePath, JSON.stringify(cookies, null, 2))
}

const setCookieSession = async (page , id) => {
  const filePath = `${os.homedir().replaceAll(/\\/g, "/")}/Documents/fb-bot/profiles/${selectedProfile}/cookies/${id}.json`

  if (!fs.existsSync(filePath)) {
    return Promise.resolve()
  }

  const cookiesString = fs.readFileSync(filePath, 'utf8')

  if (cookiesString) {
    const cookies = JSON.parse(cookiesString)

    await page.setCookie(...cookies)
  }
}

function initFilesProfile() {
  try {
const dir = `${os.homedir().replaceAll(/\\/g, "/")}/Documents/fb-bot/profiles`
const profileDir = `${os.homedir().replaceAll(/\\/g, "/")}/Documents/fb-bot/profiles/${selectedProfile}`
const accountsDir = `${profileDir}/accounts.json`
const postsDir = `${profileDir}/posts.json`
const pagesPath = `${profileDir}/pages`
const cookiesPath = `${profileDir}/cookies`
const profilesFile = `${os.homedir().replaceAll(/\\/g, "/")}/Documents/fb-bot/profiles.json`

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir)
}
if (!fs.existsSync(profilesFile)) {
  fs.writeFileSync(profilesFile,"[]")
}

if (!fs.existsSync(profileDir)) {
    //Efetua a criação do diretório
    fs.mkdirSync(profileDir)
    fs.mkdirSync(pagesPath)
    fs.mkdirSync(cookiesPath)
    fs.writeFileSync(accountsDir, "[]")
    fs.writeFileSync(postsDir, "[]")
  }
  }catch (err) {
    consoleAndWriteOnLog(err)
    logger.debug(err)
  }
}

var newProfileName

function setSelectedProfile (value) { // colocar selectedProfile antes dos Diretorios , fazer criação de profile fazer seleçao e deleção deprofile // mudar os diretorios do getAccounts etc para o diretorio do profile
  selectedProfile = value

  initFilesProfile(newProfileName)

  document.getElementById("first-id").style.display = "none"
  document.getElementById("main-id").style.display = "flex"

  setSavedConfigs()
}

function addProfile () { // colocar selectedProfile antes dos Diretorios , fazer criação de profile fazer seleçao e deleção deprofile
  const newProfileName = document.getElementById("profile-name-input").value
  selectedProfile = newProfileName
  initFilesProfile(newProfileName)

  const dir = `${os.homedir().replaceAll(/\\/g, "/")}/Documents/fb-bot/profiles`
  const profileDir = `${os.homedir().replaceAll(/\\/g, "/")}/Documents/fb-bot/profiles/${selectedProfile}`
  const profilesFile = `${os.homedir().replaceAll(/\\/g, "/")}/Documents/fb-bot/profiles.json`

  const profilesFileToParse = fs.readFileSync(profilesFile, {encoding: 'utf8'})
  const parsedProfilesFile = JSON.parse(profilesFileToParse)
  parsedProfilesFile.push({nome: selectedProfile, dir: profileDir})

  fs.writeFileSync(profilesFile, JSON.stringify(parsedProfilesFile ,null, 4))

  document.getElementById("first-id").style.display = "none"
  document.getElementById("main-id").style.display = "flex"

  setSavedConfigs()
}

function deleteProfile (value) { // colocar selectedProfile antes dos Diretorios , fazer criação de profile fazer seleçao e deleção deprofile
  console.log(value)
  const profilesFile = `${os.homedir().replaceAll(/\\/g, "/")}/Documents/fb-bot/profiles.json`
  const profilesFileToParse = fs.readFileSync(profilesFile, {encoding: 'utf8'})
  const parsedProfilesFile = JSON.parse(profilesFileToParse)

  const filtredProfilesFile = parsedProfilesFile.filter(profile => profile.nome !== value)

  fs.writeFileSync(profilesFile, JSON.stringify(filtredProfilesFile ,null, 4))
  // fs.unlinkSync(`${os.homedir().replaceAll(/\\/g, "/")}/Documents/fb-bot/profiles/${value}`)
  
  document.querySelector(".options-grid").innerHTML = ""
  filtredProfilesFile.forEach(perfil => {
    document.querySelector(".options-grid").innerHTML +=
     `
    <section class="options-grid-item">
        <span>${perfil.nome}</span>
        <div>
            <span style="background-color: green; border-radius: 7px; padding: 5px;" class="enter-btn" onclick="setSelectedProfile('${perfil.nome}')">Entrar</span>
            <a class="pre-delete-btn" href="#delete-modal" style="background-color: red; border-radius: 7px; padding: 5px;" data-namevalue="${perfil.nome}">Deletar</a>
        </div>
    </section>
    `

    document.getElementById("delete-modal").style.visibility = "hidden"
})

document.querySelectorAll(".enter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
      setTimeout(() => {
          showInicio()
      }, 1500);
  })
})

document.querySelectorAll(".pre-delete-btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
      console.log(e.target)
      document.getElementById("delete-btn-confirm").addEventListener("click", () => {deleteProfile(e.target.dataset.namevalue)})
      document.getElementById("delete-modal").style.visibility = "visible"
  })
})

document.getElementById("body").focus()
}

function getAllProfiles () {
  if (!fs.existsSync(`${os.homedir().replaceAll(/\\/g, "/")}/Documents/fb-bot/profiles.json`)) {
    return []
  }
  const profilesToParse = fs.readFileSync(`${os.homedir().replaceAll(/\\/g, "/")}/Documents/fb-bot/profiles.json`)
  const profilesParsed = JSON.parse(profilesToParse)

  return profilesParsed
}

function setSavedConfigs () {
  const selectedProfilePathToEdit = fs.readFileSync(`${os.homedir().replaceAll(/\\/g, "/")}/documents/fb-bot/profiles.json`)
  const selectedProfilePathToEdiParsed = JSON.parse(selectedProfilePathToEdit)
  const selectedProfileToEdit = selectedProfilePathToEdiParsed.find(profile => profile.nome === selectedProfile)

  if (selectedProfileToEdit.response) {
    document.getElementById("link").value = selectedProfileToEdit.response
    document.getElementById("link").value = selectedProfileToEdit.response
  }
  if (selectedProfileToEdit.runQuantity) {
    document.getElementById("quantidade-respostas").value = selectedProfileToEdit.runQuantity
    document.getElementById("quantidade-respostas").value = selectedProfileToEdit.runQuantity
  }
  if (selectedProfileToEdit.delay) {
    document.getElementById("tempo-pausa").value = selectedProfileToEdit.delay
    document.getElementById("tempo-pausa").value = selectedProfileToEdit.delay
  }
}


function setPending (postId) {
  let pagesToUse
    let pagesToParseToUse = fs.readFileSync(`${os.homedir().replaceAll(/\\/g, "/")}/documents/fb-bot/profiles/${selectedProfile}/posts.json`)
    pagesToUse = JSON.parse(pagesToParseToUse)
    const selectedPost = pagesToUse.find((post) => post.id.toString() === postId.toString())

      console.log(postId)
      console.log(selectedPost)

      const newPages = pagesToUse.filter(postToVisit => postToVisit.id != selectedPost.id)
      
      selectedPost.status = "pending"
      newPages.push(selectedPost)
      const toReturn = newPages.sort((a, b) => {
        if (a.status == "pending") return -1
        if (a.status == "done") return 1
        return 0
      })
      fs.writeFileSync(`${os.homedir().replaceAll(/\\/g, "/")}/Documents/fb-bot/profiles/${selectedProfile}/posts.json`, JSON.stringify(toReturn,  null, 4))

      document.getElementById("table-results").innerHTML = ""
      toReturn.forEach(post => {
    document.getElementById("table-results").innerHTML += `
              <tr>
                <td>
                    <span class="custom-checkbox">
                        <input type="checkbox" class="checkbox-delete"  name="options[]" value=${post.id}>
                        <label for="checkbox1"></label>
                    </span>
                </td>
                <td>${post.url}</td>
                <td>${post.status}</td>
                <td><button class="pending-btns" value="${post.id}" onclick="setPending(${post.id})"> Pendente <button></td>
            </tr>
            `
  });
  document.getElementById('url-input').value = ""
}


function setAllPending () {
    let pagesToUse
    let pagesToParseToUse = fs.readFileSync(`${os.homedir().replaceAll(/\\/g, "/")}/documents/fb-bot/profiles/${selectedProfile}/posts.json`)
    pagesToUse = JSON.parse(pagesToParseToUse)
    let newPages = []

  pagesToUse.forEach(page => {
    page.status = "pending"

    newPages.push(page)
  })
      
      const toReturn = newPages.sort((a, b) => {
        if (a.status == "pending") return -1
        if (a.status == "done") return 1
        return 0
      })
      fs.writeFileSync(`${os.homedir().replaceAll(/\\/g, "/")}/Documents/fb-bot/profiles/${selectedProfile}/posts.json`, JSON.stringify(toReturn,  null, 4))

      document.getElementById("table-results").innerHTML = ""
      toReturn.forEach(post => {
    document.getElementById("table-results").innerHTML += `
              <tr>
                <td>
                    <span class="custom-checkbox">
                        <input type="checkbox" class="checkbox-delete"  name="options[]" value=${post.id}>
                        <label for="checkbox1"></label>
                    </span>
                </td>
                <td>${post.url}</td>
                <td>${post.status}</td>
                <td><button class="pending-btns" value="${post.id}" onclick="setPending(${post.id})"> Pendente <button></td>
            </tr>
            `
  });
  document.getElementById('url-input').value = ""
}