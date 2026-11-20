const express = require('express');
const router = express.Router()

const { spawn }  = require('child_process');

function isValidHost(target) {
    if (typeof target !== 'string') return false;
    const t = target.trim();
    if (!t || t.length > 253) return false;
    const ipv4 = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;
    const hostname = /^(?=.{1,253}$)(?:(?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)*(?!-)[A-Za-z0-9-]{1,63}(?<!-)$/;
    return ipv4.test(t) || hostname.test(t);
}

function isSafeFilePath(filePath) {
    if (typeof filePath !== 'string') return false;
    const p = filePath.trim();
    if (!p || p.length > 512) return false;
    if (p.includes('..')) return false;
    if (/^[\w./-]+$/.test(p) === false) return false;
    return true;
}

router.post('/ping', (req,res) => {
    const target = (req.body && req.body.url) ? String(req.body.url).trim() : '';
    if (!isValidHost(target)) {
        return res.status(400).send('error');
    }

    const child = spawn('ping', ['-c', '1', target], { shell: false });

    child.on('error', () => {
        return res.send('error');
    });

    child.on('close', (code) => {
        if (code !== 0) {
            return res.send('error');
        }
        res.send('pong')
    });
    
})

router.post('/gzip', (req,res) => {
    const filePath = (req.query && req.query.file_path) ? String(req.query.file_path).trim() : '';
    if (!isSafeFilePath(filePath)) {
        return res.status(400).send('error');
    }

    const child = spawn('gzip', [filePath], { shell: false });

    child.on('error', (err) => {
        console.log('err: ', err)
        res.send('done');
    });

    child.on('close', (code) => {
        console.log('data: ', `exit code ${code}`);
        res.send('done');
    });
})

router.get('/run', (req,res) => {
   let cmd = req.params.cmd;
   runMe(cmd,res)
});

function runMe(cmd,res){
//    return spawn(cmd);

    const allowed = {
        whoami: { bin: 'whoami', args: [] },
        uptime: { bin: 'uptime', args: [] },
        date: { bin: 'date', args: [] }
    };

    if (!Object.prototype.hasOwnProperty.call(allowed, cmd)) {
        return res.status(403).send('command not allowed');
    }

    const selected = allowed[cmd];
    const cmdRunning = spawn(selected.bin, selected.args, { shell: false });

    cmdRunning.on('error', () => {
        res.send('child process exited with code 1');
    });

    cmdRunning.on('close', (code) => {
        res.send(`child process exited with code ${code}`);
    });
}

module.exports = router