const express = require('express')
const router = express.Router()

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}

router.get('/greeting', (req, res) => {
    const { name } = req.query;
    res.send('<h1> Hello :' + escapeHtml(name) + '</h1>')
})

router.get('/greet-template', (req,res) => {
    const name = req.query.name
    res.render('index', { user_name: escapeHtml(name) });
})

module.exports = router