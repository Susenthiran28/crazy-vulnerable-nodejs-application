const express = require('express');
const config = require('../config')
const router = express.Router()

const MongoClient = require('mongodb').MongoClient;
const url = config.MONGODB_URI;

function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function hasDangerousKeys(obj) {
    if (!isPlainObject(obj)) return false;

    for (const key of Object.keys(obj)) {
        if (key.startsWith('$') || key.includes('.')) {
            return true;
        }
        const value = obj[key];
        if (isPlainObject(value) || Array.isArray(value)) {
            if (hasDangerousKeys(value)) return true;
        }
    }
    return false;
}

function getRequiredString(body, field, maxLen = 256) {
    const value = body[field];
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!trimmed || trimmed.length > maxLen) return null;
    return trimmed;
}

router.post('/customers/register', async (req, res) => {
    if (!isPlainObject(req.body) || hasDangerousKeys(req.body)) {
        return res.status(400).json({ status: 'Error', message: 'Invalid request body' });
    }

    const name = getRequiredString(req.body, 'name');
    const address = getRequiredString(req.body, 'address', 1024);
    if (!name || !address) {
        return res.status(400).json({ status: 'Error', message: 'Invalid input' });
    }

    let client;
    try {
        client = await MongoClient.connect(url, { useNewUrlParser: true });
        const db = client.db(config.MONGODB_DB_NAME);
        const customers = db.collection('customers')

        let myobj = { name: name, address: address };
        await customers.insertOne(myobj);
        console.log('user registered');
        return res.json({ status: 'success', message: 'user inserted' })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ status: 'Error' });
    } finally {
        if (client) {
            await client.close();
        }
    }

})


// Vulnerable search function
router.post('/customers/find', async (req, res) => {
    if (!isPlainObject(req.body) || hasDangerousKeys(req.body)) {
        return res.status(400).json({ status: 'Error', message: 'Invalid request body' });
    }

    const name = getRequiredString(req.body, 'name');
    if (!name) {
        return res.status(400).json({ status: 'Error', message: 'Invalid input' });
    }

    let client;
    try {
        client = await MongoClient.connect(url, { useNewUrlParser: true });
        const db = client.db(config.MONGODB_DB_NAME);
        const customers = db.collection('customers')

        let myobj = { name: name };
        const result = await customers.findOne(myobj);
        return res.json(result)
    } catch (err) {
        console.log(err);
        return res.status(500).json({ status: 'Error' });
    } finally {
        if (client) {
            await client.close();
        }
    }


})

// Vulnerable Authentication
// Authentication Bypass Example
// curl -X POST http://localhost:3000/customers/login/ --data "{\"email\": {\"\$gt\":\"\"} , \"password\": {\"\$gt\":\"\"}}" -H "Content-Type: application/json"

router.post('/customers/login', async (req, res) => {
    if (!isPlainObject(req.body) || hasDangerousKeys(req.body)) {
        return res.status(400).json({ status: 'Error', message: 'Invalid request body' });
    }

    const email = getRequiredString(req.body, 'email');
    const password = getRequiredString(req.body, 'password');
    if (!email || !password) {
        return res.status(400).json({ status: 'Error', message: 'Invalid input' });
    }

    let client;
    try {
        client = await MongoClient.connect(url, { useNewUrlParser: true });
        const db = client.db(config.MONGODB_DB_NAME);
        const customers = db.collection('customers')

        let myobj = { email: email, password: password };
        const result = await customers.findOne(myobj);
        return res.json(result)
    } catch (err) {
        console.log(err);
        return res.status(500).json({ status: 'Error' });
    } finally {
        if (client) {
            await client.close();
        }
    }


})

module.exports = router