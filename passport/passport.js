/* 登入驗證策略 */

import passport from 'passport'  // 整合驗證方法的套件
import passportJWT from 'passport-jwt'
import passportLocal from 'passport-local'  // 帳號密碼驗證策略
import bcrypt from 'bcrypt'
import users from '../models/users.js'

// 引用 local 驗證策略，帳號密碼驗證
const LocalStrategy = passportLocal.Strategy
const JWTStrategy = passportJWT.Strategy
const ExtractJWT = passportJWT.ExtractJwt



// 登入時去資料庫找有沒有這個帳號
// 使用LocalStrategy的驗證策略，去新增一個名為 login 的驗證方式，
passport.use('login', new LocalStrategy({
    // LocalStrategy 也可以自訂欄位名稱
    // ↓重新命名這兩個來符合自己的資料欄位
    usernameField: 'account',
    passwordField: 'password'
},
    // 驗證策略過了之後會給 account, password 跟 done (錯誤, 放進req.user的內容, 放進 info的內容)
    //  async (解出來的帳號欄位值,密碼欄位值,最後做完要呼叫去下一步的動作)  
    async (account, password, done) => {
        // 驗證過後會執行的 function
        try {
            // 找有沒有這個帳號
            const user = await users.findOne({ account })
            if (!user) {
                return done(null, false, { message: '帳號不存在' })
            }
            // 判斷密碼是否正確
            // bcrypt.compareSync(未加密文字, 已加密文字)
            if (!bcrypt.compareSync(password, user.password)) {
                return done(null, false, { message: '密碼錯誤' })
            }
            return done(null, user)
        } catch (error) {
            return done(error, false)
        }
    }))
// ↑ 驗證策略成功才會進入這個function (驗證策略成功執行，但帳密跟資料庫對照不合才回傳passport的錯誤訊息)，沒成功的話在auth.js那邊就會回傳錯誤訊息




// 新增一個名為 jwt 的驗證方式，使用 JWT 策略  (驗證jwt對不對)
passport.use('jwt', new JWTStrategy({
    // 從 headers (AuthHeader) 提取 Bearer Token
    // 對應postman的 Bearer Token
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    // JWT 驗證 secret  (解譯jwt的秘鑰)
    secretOrKey: process.env.JWT_SECRET,

    // ↓把req資料傳進 callback裡面
    passReqToCallback: true,
    // ↓忽略過期 (自己寫過期驗證)
    ignoreExpiration: true


    // 驗證成功的callback (同localstrategy的async寫法)
}, async (req, payload, done) => {
    // payload是解譯後的資料
    // done(錯誤(err), 放進req.user的內容(user), 放進 info 的內容(info))


    //                     分鐘  * 1000     毫秒
    const expired = payload.exp * 1000 < Date.now()
    // 如果過期了     網址不是  '/users/extend'              不是登出
    if (expired && req.originalUrl !== '/users/extend' && req.originalUrl !== '/users/logout') {
        return done(null, false, { message: '登入逾期' })
    }
    // payload 是解譯後的資料
    // done(錯誤, 傳到 auth 的資料, 放進 info 的內容)
    // req.headers.authorization 格式為 Bearer asdasdasdasd
    // { Bearer asdasdasdasd }  字串  .split  (用空格分割) 後取第二項 [1]   >> 取得asdasdasdasd
    const token = req.headers.authorization.split(' ')[1]
    try {
        // 尋找解譯出來的使用者，且有目前這組序號
        const user = await users.findById(payload._id)
        if (!user) {
            return done(null, false, { message: '使用者不存在' })
        }
        if (user.tokens.indexOf(token) === -1) {
            return done(null, false, { message: '驗證錯誤' })
        }
        return done(null, { user, token })
    } catch (error) {
        return done(error, false)
    }
}))
