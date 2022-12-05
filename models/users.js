import mongoose from 'mongoose'
import validator from 'validator'

//           = 轉成可以對資料做操作的model 再匯出
const schema = new mongoose.Schema({
    // 欄位名稱
    account: {
        // 資料型態
        type: String,
        // 最小最大字串長度
        minlength: [5, '少於8個英文或數字'],
        maxlength: [15, '多於15個英文或數字'],
        // 傳進來的[必填和錯誤訊息]
        require: [true, '帳號請輸入5~15個英文或數字'],
        // 唯一性驗證 帳號只能註冊一次
        unique: true,

        // 驗證格式  \w 匹配字母、数字、底線。等於 [A-Za-z0-9_]
        /*
            $ 匹配输入字符串的结尾位置。如果设置了 RegExp 对象的 Multiline 属性，则 $ 也匹配 '\n' 或 '\r'。
            + 匹配前面的子表达式一次或多次。例如，zo+ 能匹配 "zo" 以及 "zoo"，但不能匹配 "z"。+ 等价于 {1,}。
            ^開始$結束
        */
        //    [^\W] 不包含「代表除了所有字母、數字及底線以外的字元」
        // 正則表達式驗證
        match: [/^\w[^\W]+$/, '密碼格式錯誤(schema)']

    },
    password: {
        type: String,
        require: [true, '請輸入5~15個英文或數字']
        // match: [/^\w[^\W]+$/, '密碼格式錯誤(schema_match_password)']  //  擋了就不能放 bcrypt ，密碼在controller驗證
    },
    email: {
        type: String,
        unique: '信箱已使用',
        // 自訂驗證規則 COPY
        validate: {
            // 驗證 function
            validator(value) {
                return validator.isEmail(value)
            },
            // 錯誤訊息
            message: '信箱格式錯誤'
        }
    },
    phone: {
        type: String,
        require: [true, '請輸入電話號碼'],
        maxlength: [20, '手機或電話號碼過長'],
        match: [/^[0-9]+$/, '請輸入數字']
    },

    userName: {
        type: String,
        maxlength: [10, '用戶名稱過長'],
        require: [true, '請輸入使用者名稱'],
        // 刪除前後空格
        trim: true
    },

    // 使用者大頭貼
    avatar: {
        type: String
    },

    // 因為是用jwt登入，要把簽出來的token存進資料庫 (因為jwt簽下去後無法撤銷簽證)
    tokens: {
        type: [String]
    },
    role: {
        // 0 = 使用者
        // 1 = 管理員
        type: Number,
        default: 0
    },

    // 紀錄會員過去的訂單  (需要ㄇ)
    pastOrders: {
        // 過去訂位為陣列(只存訂位id)
        type: [
            {
                order: {
                    type: mongoose.ObjectId,
                    ref: 'order'
                }
            }
        ]
    }

},
    // 不要紀錄資料修改次數
    { versionKey: false }) // 不使用版本控制

//             mongoose.model(collection 名稱, Schema)
export default mongoose.model('users', schema)
// 把schema轉成可以操作的 model (固定寫法)
