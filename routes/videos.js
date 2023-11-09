const express = require('express');
const router = express.Router();
const path = require("path");
const fs = require("fs");

router.get('/:name', (req, res) => {

    const params = req.params;
    const fileName = params['name']

    if (!fileName) {
        return res.status(200).send('file name needed!');
    }

    const filePath = path.resolve(__dirname, `../public/vids/${fileName}.mp4`);

    const stat = fs.statSync(filePath);

    const fileSize = stat.size;

    const range = req.headers.range;

    if (range) {
        const parts = range.replace(/bytes=/, '').split('-')
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        const chunksize = end - start + 1;
        const file = fs.createReadStream(filePath, { start, end });
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4'
        };
        res.writeHead(206, head);
        file.pipe(res);
    }
    else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4'
        };
        res.writeHead(200, head);
        fs.createReadStream(filePath).pipe(res)
    }
})

module.exports = router;