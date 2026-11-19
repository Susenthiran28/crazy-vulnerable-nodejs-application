
console.log('WIP')
const express = require('express');
const router = express.Router()

function getSafeRedirectTarget(input, options = {}) {
    const allowRelative = options.allowRelative !== false;
    const allowedHosts = new Set(options.allowedHosts || []);

    if (typeof input !== 'string') return null;
    const raw = input.trim();
    if (!raw) return null;
    if (raw.startsWith('//')) return null;

    if (allowRelative && raw.startsWith('/')) {
        return raw;
    }

    try {
        const parsed = new URL(raw);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
        if (!allowedHosts.has(parsed.host)) return null;
        return parsed.toString();
    } catch (e) {
        return null;
    }
}

router.get('/login',function(req, res){
    let followPath = req.query.path;
    const safePath = getSafeRedirectTarget(followPath, { allowRelative: true }) || '/';
    if(req.session.isAuthenticated()){
        res.redirect('http://example.com' + safePath); //false positive
    }else{
        res.redirect('/');
    }
}); 

router.get('/goto',function(req, res){
    const safeUrl = getSafeRedirectTarget(req.query.url, {
        allowRelative: true,
        allowedHosts: ['example.com']
    }) || '/';
    res.redirect(safeUrl);
}); 


module.exports = router
