const express = require('express');
const router = express.Router()


router.get("/tstMe/:id", (req, res) => { 
    const r = /^[a-z]+$/;
    const id = req.params.id;

    if (typeof id !== 'string') {
        return res.json({ match: false });
    }

    const match = r.test(id);
    res.json({ match })
    
});


module.exports = router