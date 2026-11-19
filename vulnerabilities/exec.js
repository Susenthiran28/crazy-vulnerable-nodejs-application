const express = require('express');
const router = express.Router()

const { spawn }  = require('child_process');

const PING_TARGETS = {
    localhost: '127.0.0.1',
    dns: '8.8.8.8'
};

const RUN_COMMANDS = {
    nodeVersion: { program: 'node', args: ['--version'] },
    npmVersion: { program: 'npm', args: ['--version'] }
};

function isSafeFilePath(filePath) {
    return typeof filePath === 'string' && /^[a-zA-Z0-9._/\-]+$/.test(filePath) && !filePath.includes('..');
}

router.post('/ping', (req,res) => {
    const targetKey = req.body && req.body.url;
    const host = PING_TARGETS[targetKey];

    if (!host) {
        return res.status(400).send('error');
    }

    const proc = spawn('ping', ['-c', '1', host], { shell: false });

    proc.on('error', () => {
        return res.send('error');
    });

    proc.on('close', (code) => {
        if (code !== 0) {
            return res.send('error');
        }
        res.send('pong')
    });
    
})

router.post('/gzip', (req,res) => {
    const filePath = req.query && req.query.file_path;

    if (!isSafeFilePath(filePath)) {
        return res.status(400).send('error');
    }

    const proc = spawn('gzip', [filePath], { shell: false });

    proc.on('error', (err) => {
        console.log('err: ', err)
        res.send('done');
    });

    proc.on('close', (code) => {
        console.log('data: ', `exit code ${code}`);
        res.send('done');
    });
})

router.get('/run', (req,res) => {
   let cmd = (req.params && req.params.cmd) || (req.query && req.query.cmd);
   const selected = RUN_COMMANDS[cmd];

   if (!selected) {
       return res.status(400).send('invalid command');
   }

   runMe(selected.program, selected.args, res)
});

function runMe(program,args,res){
//    return spawn(cmd);

    const cmdRunning = spawn(program, args, { shell: false });
    cmdRunning.on('error', () => {
        res.send('child process exited with code 1');
    });
    cmdRunning.on('close', (code) => {
        res.send(`child process exited with code ${code}`);
    });
}

module.exports = router