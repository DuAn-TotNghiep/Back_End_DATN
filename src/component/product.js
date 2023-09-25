

const connect = require('../../database');

 const GetALlBook = async (req, res) => {
    try {
        const sql = `SELECT * FROM color`
        connect.query(sql, (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Lay All that bai', err })
            }
            const data = results.rows
            return res.status(200).json({ message: 'Lay All thanh cong', data })
        })
    } catch (err) {
        return res.status(500).json({ message: 'Loi api', err })
    }
}
module.exports = { GetALlBook };