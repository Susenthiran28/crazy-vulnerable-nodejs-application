const express = require('express');
const config = require('../config')
const router = express.Router()

const MongoClient = require('mongodb').MongoClient;
const url = config.MONGODB_URI;

function hasUnsafeKeys(value) {
    if (value === null || value === undefined) {
        return false;
    }
    if (Array.isArray(value)) {
        for (const item of value) {
            if (hasUnsafeKeys(item)) return true;
        }
        return false;
    }
    if (typeof value === 'object') {
        for (const key of Object.keys(value)) {
            if (key.startsWith('$') || key.includes('.')) {
                return true;
            }
            if (hasUnsafeKeys(value[key])) {
                return true;
            }
        }
    }
    return false;
}

function getValidatedString(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    return trimmed;
}

router.post('/customers/register', async (req, res) => {

    const name = getValidatedString(req.body && req.body.name);
    const address = getValidatedString(req.body && req.body.address);

    if (!name || !address || hasUnsafeKeys(req.body)) {
        return res.status(400).json({ status: "Error", message: "Invalid input" });
    }

    const client = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch(err => { console.log(err); });
    if (!client) {
        return res.json({ status: "Error" });
    }
    const db = client.db(config.MONGODB_DB_NAME);
    const customers = db.collection("customers")

    let myobj = { name: name, address: address };
    customers.insertOne(myobj, function (err) {
        if (err) {
            client.close();
            return res.status(500).json({ status: "Error" });
        }
        console.log("user registered");
        res.json({ status:"success", "message": "user inserted" })
        client.close();
    });

})


// Vulnerable search function
router.post('/customers/find', async (req, res) => {

    const name = getValidatedString(req.body && req.body.name);
    if (!name || hasUnsafeKeys(req.body)) {
        return res.status(400).json({ status: "Error", message: "Invalid input" });
    }

    const client = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch(err => { console.log(err); });
    if (!client) {
        return res.json({ status: "Error" });
    }
    const db = client.db(config.MONGODB_DB_NAME);
    const customers = db.collection("customers")

    let myobj = { name: name };
    customers.findOne(myobj, function (err, result) {
        if (err) {
            client.close();
            return res.status(500).json({ status: "Error" });
        }
        client.close();
        res.json(result)
    });


})

// Vulnerable Authentication
// Authentication Bypass Example
// curl -X POST http://localhost:3000/customers/login/ --data "{\"email\": {\"\$gt\":\"\"} , \"password\": {\"\$gt\":\"\"}}" -H "Content-Type: application/json"

router.post('/customers/login', async (req, res) => {

    const email = getValidatedString(req.body && req.body.email);
    const password = getValidatedString(req.body && req.body.password);
    if (!email || !password || hasUnsafeKeys(req.body)) {
        return res.status(400).json({ status: "Error", message: "Invalid input" });
    }

    const client = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch(err => { console.log(err); });
    if (!client) {
        return res.json({ status: "Error" });
    }
    const db = client.db(config.MONGODB_DB_NAME);
    const customers = db.collection("customers")

    let myobj = { email: email, password: password };
    customers.findOne(myobj, function (err, result) {
        if (err) {
            client.close();
            return res.status(500).json({ status: "Error" });
        }
        client.close();
        res.json(result)
    });


})

module.exports = router