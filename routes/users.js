import express from "express";
import users from "../models/users.js";

// auth裡面 export 是login，要這樣設定才不會衝突
import * as auth from '../middleware/auth.js'

import content from '../middleware/content.js'


import {
    register,
    login,
    getUserId,
    getUser,
    getData,
    logout
} from '../controllers/users.js'





// 建立路由
const router = express.Router()




//                content 是middleware寫的 認證內容的function
router.post('/', content('application/json'), register)


//          (路由進到/login之後，在執行 login 之前先執行 auth.login和 content('application/json') )
//           進 /login之後，先驗證格式、驗證資料庫有沒有這個帳號，再跑實際登入
router.post('/login', content('application/json'), auth.login, login)


// res.status(200).json()
router.get('/getuserid/:id', getUserId)

// res.status(200).send()
router.get('/getuser', auth.jwt, getUser)


// res.status(200).json()
// 在Authorization 用token抓
// auth.jwt >> 驗證過期就不能get
router.get('/me', auth.jwt, getData)

router.delete('/logout', auth.jwt, logout)



// http://localhost:4000/users/login   登入 
// http://localhost:4000/users/62feeb03f662a7a0c593820   查特定id會員


export default router

