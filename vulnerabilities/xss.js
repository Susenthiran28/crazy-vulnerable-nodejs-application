const express = require('express')
const router = express.Router()

function escapeHtml(value) {
    const str = Array.isArray(value) ? value.join(',') : (value == null ? '' : String(value))
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}

router.get('/greeting', (req, res) => {
    const { name } = req.query;
    const safeName = escapeHtml(name)
    res.send('<h1> Hello :' + safeName + '</h1>')
})

router.get('/greet-template', (req,res) => {
    const name = req.query.name
    const safeName = escapeHtml(name)
    res.render('index', { user_name: safeName });
})

module.exports = router