const express = require('express')
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

const app = express()
const port = 3000

app.set('view engine', 'ejs'); //for template injection
app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));
app.use(fileUpload());

app.get('/', (req, res) => res.send('Hello World!'))

app.use('/xss', require('./vulnerabilities/xss'));
app.use('/sqli', require('./vulnerabilities/sqli'));
app.use('/exec', require('./vulnerabilities/exec'));
app.use('/loop', require('./vulnerabilities/loop'));
app.use('/redos', require('./vulnerabilities/redos'));
app.use('/xxe', require('./vulnerabilities/xxe'));
app.use('/ssrf', require('./vulnerabilities/ssrf'));

app.use((err, req, res, next) => {
	if (err && (err.type === 'entity.too.large' || err.status === 413)) {
		return res.status(413).json({ error: 'Payload too large' });
	}
	return next(err);
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))