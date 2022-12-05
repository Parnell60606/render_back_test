import mongoose from 'mongoose'

const schema = new mongoose.Schema({
    user: {
        type: mongoose.ObjectId,
        ref: 'users',
        required: [true, '使用者未登入']
    },

    // orderDetails: [{
    bookingDate: {
        // type: Date,
        type: Number, // unix時間是用number儲存
        required: [true, '請輸入日期']
    },
    bookingTime: {
        // type: Date,
        type: Number, // unix時間是用number儲存
        required: [true, '請輸入時間']
    },
    numberOfPeople: {
        type: Number,
        required: [true, '請輸入人數'],
        max: [20, '訂位人數過多']
    },
    usersNote: {
        type: String,
        default: ''
    },
    // }],

    /* orderDetailsTwo: [name, email, phone], */

    orderStatus: {
        // 1.審核中  2.以確認  3.已取消
        type: Number,
        min: 1,
        max: 3,
        default: 1
    },
    isFieldBooking: {
        // 1. 是現場訂單  0. 是會員訂單
        type: Number,
        default: 0
    },
    createdAt: Number,
    updatedAt: Number


}, {
    // timestamps 是用 ISO-Date 格式儲存，
    // 用下面的函式覆蓋，改成unix儲存  (上面createdAt跟updatedAt資料形態要改成Number)

    timestamps: {
        // 以秒為單位 (去尾數)
        // Date.now() 是本地時間
        currentTime: () => Math.floor(Date.now() / 1000)
    }

    // createdAt: 表示此文檔創建時間的日期
    // updatedAt：表示此文檔上次更新時間的日期
    // 查詢方式  直接用 createdAt  updatedAt (跟上面的 numberOfPeople 等查詢方式一樣 )
})

//             mongoose.model(collection 名稱, Schema)
export default mongoose.model('Orders', schema)
// 資料表名稱必須為複數，結尾加 s
