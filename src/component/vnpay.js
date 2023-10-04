const { DateTime } = require('luxon');
const connect = require('../../database');



const vnpay = async (req, res) => {
    try {

    } catch (error) {
        return res.status(500).json({ message: 'Loi API VNPAY', err })
    }
}


module.exports = { vnpay };