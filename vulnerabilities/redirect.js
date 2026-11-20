console.log('WIP')
const express = require('express');
const router = express.Router()

function getSafeRedirectPath(input) {
    if (typeof input !== 'string') return null;
    const value = input.trim();
    if (!value.startsWith('/')) return null;
    if (value.startsWith('//')) return null;
    if (value.includes('\\')) return null;
    if (/[\r\n\t]/.test(value)) return null;
    return value;
}

router.get('/login',function(req, res){
    let followPath = getSafeRedirectPath(req.query.path) || '/';
    if(req.session.isAuthenticated()){
        res.redirect(followPath); //false positive
    }else{
        res.redirect('/');
    }
}); 

router.get('/goto',function(req, res){
    let url = getSafeRedirectPath(req.query.url) || '/';
    res.redirect(url);
}); 


module.exports = router
