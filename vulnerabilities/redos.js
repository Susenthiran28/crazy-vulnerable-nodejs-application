const express = require('express');
const router = express.Router()


router.get("/tstMe/:id", (req, res) => {
    const { id } = req.params;

    if (typeof id !== 'string' || id.length === 0 || id.length > 64 || !/^[a-z]+$/.test(id)) {
        return res.status(400).json({ error: 'Invalid id' });
    }

    const r = /^[a-z]+$/;
    const match = r.test(id);
    res.json({ match });

});


module.exports = router