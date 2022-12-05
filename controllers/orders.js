import users from '../models/users.js'
import orders from '../models/orders.js'
import jwt from 'jsonwebtoken'
import products from '../models/products.js'




export const createOrder = async (req, res) => {

    try {

        // console.log(youHaveOrdered)

        const result = await orders.create({
            user: req.user._id,
            numberOfPeople: req.body.numberOfPeople,
            bookingDate: req.body.bookingDate,
            bookingTime: req.body.bookingTime,
            usersNote: req.body.usersNote,
            orderStatus: req.body.orderStatus,
            isFieldBooking: req.body.isFieldBooking
        })
        res.status(200).send({ success: true, message: '', result: result._id })
    } catch (error) {
        if (error.name === 'ValidationError') {
            const key = Object.keys(error.errors)[0]
            const message = error.errors[key].message
            return res.status(400).send({ success: false, message })
        } else if (error.name === 'MongoServerError' && error.code === 11000) {
            res.status(400).send({ success: false, message: '40404(order)' })
        } else {
            res.status(500).send({ success: false, message: '伺服器錯誤' })
        }
    }
}






//  查過去訂單
export const getMyPastOrders = async (req, res) => {
    try {
        // 用過去訂單數量判斷user過去有沒有訂單
        if (req.user.pastOrders.length === 0) {
            return res.status(400).send({ success: false, message: '過去沒有訂單' })
        }

        // 用前台傳來的userID 來查詢 pastOrders(過去訂單)  ，populate (把fk連往另一個schema的資料也傳過來)
        let result = await users.findById(req.user._id, 'pastOrders').populate('pastOrders.order')
        // 可以使用 Population 功能通過關聯Schema的 field 找到關聯的另一個 document，並且用被關聯 document 的內容替換掉原來關聯欄位(field)的內容。

        //  新增訂單   (其他訂單資料該怎麼寫)
        result = await orders.create({
            user: req.user._id,

            userName: req.user._id,

            numberOfPeople: req.user.numberOfPeople,
            bookingTime: req.user.bookingTime,
            usersNote: req.user.usersNote,
            orderStatus: req.user.orderStatus
        })
        await req.user.save()
        res.status(200).send({ success: true, message: '', result: result._id })
    } catch (error) {
        res.status(500).send({ success: false, message: '伺服器錯誤' })
    }
}






//
export const getMyOrders = async (req, res) => {
    try {
        //
        const result = await orders.find({ user: req.user._id }).populate('products.product')
        res.status(200).send({ success: true, message: '', result })
    } catch (error) {
        res.status(500).send({ success: false, message: '伺服器錯誤' })
    }
}


// TEST   用ID查訂單
export const getMyOrder = async (req, res) => {
    try {
        const result = await orders.findById(req.params.id)
        if (!result) {
            console.log(result)
            res.status(404).json({ success: false, message: '找不到資料(try catch order' })
        } else {
            res.status(200).json({ success: true, message: '', result })
        }
    } catch (error) {
        res.status(500).send({ success: false, message: '伺服器錯誤' })
    }
}



// 要帶著token抓
export const getAllOrders = async (req, res) => {
    try {
        // .populate('user', 'account')
        // 自動抓 user 欄位對應的 ref 資料，只取 account 欄位
        const result = await orders.find().populate('user', 'userName')
        res.status(200).send({ success: true, message: '', result })
    } catch (error) {
        res.status(500).send({ success: false, message: '伺服器錯誤' })
    }
}


