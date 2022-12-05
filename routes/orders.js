import express from 'express'
import content from '../middleware/content.js'
import * as auth from '../middleware/auth.js'  // jwt抓前台資料
import admin from '../middleware/admin.js'   // admin權限

import {
    createOrder,
    getMyOrder,
    getAllOrders

} from '../controllers/orders.js'

// 建立路由
const router = express.Router()



router.post('/', auth.jwt, createOrder)


router.get('/getbyid/:id', getMyOrder)



router.get('/all', auth.jwt, admin, getAllOrders)


export default router

