import 'dotenv/config'
// 開網站即可接收資料
import express from 'express'
// mongoDB操作工具
import mongoose from 'mongoose'
// 跨域套件
import cors from 'cors'

// ?
import mongoSanitize from 'express-mongo-sanitize'


import usersRouter from './routes/users.js'
import ordersRouter from './routes/orders.js'

import './passport/passport.js'




// 用INDEX測試controll
// import users from './models/users.js'



// 連接mondoDB資料庫 (網址放在.env)
// DB_URL是環境變數可以自己設
mongoose.connect(process.env.DB_URL)
// ?
mongoose.set('sanitizeFilter', true)


const app = express()


// 跨域請求 (放第一關)
// 把 origin === undefined 拿掉會顯示   message: '請求格式錯誤'
app.use(cors({
    // origin 為請求來源網域, callback 為是否允許的回應
    origin(origin, callback) {
        if (origin === undefined || origin.includes('github') || origin.includes('localhost') || origin.includes('127.0.0.1:5173')) {
            callback(null, true)
        } else {
            callback(new Error('Not Allowed'), false)
        }
    }
}))
// 在本機測試 origin.includes('127.0.0.1:5173')   << 之後記得刪


// 預設全部同意
// app.use(cors());



// 讀取 req.body 的 json (抓post資料)
app.use(express.json())

app.use((_, req, res, next) => {
    res.status(400).send({ success: false, message: '請求格式錯誤' })
})


// ?
app.use(mongoSanitize())


// 將路由分類，所有進到 /users 路徑的請求使用 users 的路由
// http://localhost:4000/users   這個網址後面可以對user資料庫做動作 
app.use('/users', usersRouter)
app.use('/orders', ordersRouter)



// 上面不符合的所有請求方式及所有路徑顯示 404
app.all('*', (req, res) => {
    res.status(404).send({ success: false, message: '找不到 404 (index)' })
})


// 請求方法 (post進 根目錄 的請求會引用這個function)
// app.post('/')




// 監聽 (跟line機器人一樣)
// 在 4000 port 啟用
app.listen(process.env.PORT || 4000, () => {
    console.log('Server States')
})
