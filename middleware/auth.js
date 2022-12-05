import passport from 'passport'
import jsonwebtoken from 'jsonwebtoken'




// 要寫middleware一定要有三個參數 req, res, next
// 有要下一步就 next()出去，沒有就res回傳

export const login = (req, res, next) => {
    // 使用 login 驗證方式
    // (err, user, info) 是 passport的 done() 傳出的
    // done(錯誤(err), 放進req.user的內容(user), 放進 info 的內容(info))
    passport.authenticate('login', { session: false }, (err, user, info) => {
        // 如果有錯誤，或是沒有找到使用者
        if (err || !user) {
            console.log(req.body)
            if (info.message === 'Missing credentials') info.message = '欄位錯誤'
            res.status(400).json({ success: false, message: info.message })
            return
        }
        // 把查詢到的使用者放進 req 物件
        // 之後的 middleware 就能拿req.user直接使用
        req.user = user
        // 繼續下一個 middleware
        next()
    })(req, res, next) // 把req, res, next 傳進前面的function裡面
}





/*
    jwt登入的情況下不需要cookie(用不到)
    { session: false } 關掉cookie
    前後端分離的情況下，不同網域傳cookie會有問題 (要跨網域傳cookie很麻煩)
*/

export const jwt = (req, res, next) => {
    // 使用 jwt 驗證方式
    // (err, user, info) 是 done() 傳出的
    passport.authenticate('jwt', { session: false }, (err, data, info) => {
        // 如果有錯誤，或是沒有找到使用者
        if (err || !data) {
            if (info instanceof jsonwebtoken.JsonWebTokenError) {
                res.status(400).json({ success: false, message: 'JWT錯誤' })
            } else {
                res.status(400).json({ success: false, message: info.message })
            }
            return
        }
        req.user = data.user
        req.token = data.token
        next()
    })(req, res, next)
}
