/* 內容格式錯誤  連 routes   */
export default (type) => {
    // 寫midddleware一定要有三個
    return (req, res, next) => {
        //  ( 如果請求沒有任何類型(不含任何body)    或       請求的內容類型不是json ('application/json'寫在router那邊)  )
        // application/json 是種在 post api 時常見的格式，這個位置會根據後端要求要用哪種格式傳送而改變。
        if (!req.headers['content-type'] || !req.headers['content-type'].includes(type)) {
            return res.status(400).send({ success: false, message: '資料格式錯誤 ( middleware / content ) ' })
        }
        next()
    }
}
