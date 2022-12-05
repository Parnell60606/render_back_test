import users from '../models/users.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken' // passport-jwt套件中有，不用另外安裝

// 註冊 (O)
export const register = async (req, res) => {
    const password = req.body.password
    // 驗證密碼
    if (!password) {
        return res.status(400).send({ success: false, message: '缺少密碼欄位' })
    }
    if (password.length < 5) {
        return res.status(400).send({ success: false, message: '密碼必須 7 個字以上（不含七）' })
    }
    if (password.length > 16) {
        return res.status(400).send({ success: false, message: '密碼必須 16 個字以下' })
    }
    if (!password.match(/^\w[^\W]+$/)) {
        return res.status(400).send({ success: false, message: ' (controllers) 密碼格式錯誤' })
    }


    // bcrypt 密碼加密
    // 因為密碼會存成這樣："$2b$10$643StLWhLHl2dlcMjXsGWOgyUVLiSHdL..bTaqIozwS8GzFEzVP.G"  所以schema的密碼驗證不能放正則表達式(和其他字數限制)

    //                bcrypt . sync同步hash寫法 (password, 加鹽次數)
    req.body.password = bcrypt.hashSync(password, 10)






    try {
        // 創建帳號
        await users.create(req.body)
        res.status(200).send({ success: true, message: '' })

    } catch (error) {
        console.log(error)
        if (error.name === 'ValidationError') {
            const key = Object.keys(error.errors)[0]
            const message = error.errors[key].message
            return res.status(400).send({ success: false, message })
        } else if (error.name === 'MongoServerError' && error.code === 11000) {
            res.status(400).send({ success: false, message: '帳號已存在' })
        } else {
            res.status(500).send({ success: false, message: '伺服器錯誤' })
        }
    }
}




export const login = async (req, res) => {
    try {
        // 簽入jwt
        // jwt.sign(資料, secret, 設定)
        const token = jwt.sign({ _id: req.user._id.toString() }, process.env.JWT_SECRET,
            { expiresIn: '7 days' } // 多久後過期
        )
        req.user.tokens.push(token)
        await req.user.save()


        // 登入成功的話回傳前台要用的資料(含token)
        res.status(200).send({
            success: true,
            message: '',
            result: {
                token,
                account: req.user.account,
                userName: req.user.userName,
                email: req.user.email,
                phone: req.user.phone,
                role: req.user.role
            }
        })
    } catch (error) {
        res.status(500).json({ success: false, message: '伺服器錯誤' })
    }
}
// 登入成功後，使用者做任何操作都要帶token (才能知道是誰)
// jwt 功能類似 cookie，但是cookie比較麻煩，現在都用jwt了






// 0627 登出　最後一版

export const logout = async (req, res) => {
    try {
        // 把jwt從資料庫撤銷
        //                                   (token跟回傳的token一樣就踢掉，不一樣就留著)
        req.user.tokens = req.user.tokens.filter(token => token !== req.token)
        await req.user.save()
        res.status(200).json({ success: true, message: '' })
    } catch (error) {
        res.status(500).json({ success: false, message: '伺服器錯誤' })
    }
}

// 0704  token過期  舊換新   (最後一版)

export const extend = async (req, res) => {
    try {
        // idx = 舊 token 的 index
        const idx = req.user.tokens.findIndex(token => token === req.token)
        // 簽新的 token
        const token = jwt.sign({ _id: req.user._id }, process.env.SECRET, { expiresIn: '7 days' })
        // 把舊token換成新token
        req.user.tokens[idx] = token
        // 儲存
        await req.user.save()
        // 把新的token傳出去
        res.status(200).send({ success: true, message: '', result: token })
    } catch (error) {
        res.status(500).send({ success: false, message: '伺服器錯誤' })
    }
}


export const getUserId = async (req, res) => {
    try {
        // 傳該會員的所有資料(除了password)
        const result = await users.findById(req.params.id)
        console.log(users.findById(req.params.id))
        if (!result) {
            res.status(404).json({ success: false, message: '找不到資料' })
        } else {
            res.status(200).json({ success: true, message: '', result })
        }
    } catch (error) {
        console.log(error)
        if (error.name === 'CastError') {
            res.status(404).json({ success: false, message: '找ㄅ到資料 (CastError)' })
        } else {
            res.status(500).json({ success: false, message: '查詢失敗' })
        }
    }
}


// json
// 用token抓
export const getData = (req, res) => {
    res.status(200).json({
        success: true,
        message: '',
        // 資料已經在 驗證(passport.js) 時被存進 req.user 了，所以直接用就好
        result: {
            _id: req.user._id,
            account: req.user.account,
            userName: req.user.userName,
            email: req.user.email,
            avatar: req.user.avatar,
            pastOrders: req.user.pastOrders
        }
    })
}





// send
// 抓會員  0718版
export const getUser = (req, res) => {
    try {
        res.status(200).send({
            success: true,
            message: '',
            result: {
                id: req.user.id,
                account: req.user.account,
                userName: req.user.userName,
                email: req.user.email,
                phone: req.user.phone,
                avatar: req.user.avatar,
                role: req.user.role,
                pastOrders: req.user.pastOrders
            }
        })
    } catch (error) {
        res.status(500).send({ success: false, message: '伺服器錯誤(getUser)' })
    }
}


