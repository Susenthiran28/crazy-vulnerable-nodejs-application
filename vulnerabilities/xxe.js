const express = require('express')
const libxmljs = require('libxml')
const db = require('db');
const router = express.Router()

router.post('/upload-products', (req, res) => {
    const XMLfile = req.files.products.data;

	if (/<\!DOCTYPE|<\!ENTITY/i.test(XMLfile.toString())) {
		return res.status(400).send('Invalid XML')
	}

	let products
	try {
		products = libxmljs.parseXmlString(XMLfile, { noent: false, noblanks: true })
	} catch (e) {
		return res.status(400).send('Invalid XML')
	}

	products.root().childNodes().forEach(product => {
		let newProduct = new db.Product()
		newProduct.name = product.childNodes()[0].text()
		newProduct.description = product.childNodes()[3].text()
		newProduct.save()
    });
    
    res.send('Thanks')
})

module.exports = router