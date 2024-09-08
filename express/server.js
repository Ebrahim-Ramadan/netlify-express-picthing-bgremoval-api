'use strict';
const express = require('express');
const path = require('path');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');
const { Rembg } = require('@xixiyahaha/rembg-node');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    if (!req.body.image) {
      return res.status(400).send('No image data provided');
    }

    const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    const input = sharp(buffer);

    const rembg = new Rembg({
      logging: true,
    });

    const output = await rembg.remove(input);

    const processedBuffer = await output.webp().toBuffer();

    const processedBase64 = processedBuffer.toString('base64');

    res.json({ image: `data:image/webp;base64,${processedBase64}` });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.use(bodyParser.json());
app.use('/.netlify/functions/server', router);  // path must route to lambda
// app.use('/', (req, res) => res.sendFile(path.join(__dirname, '../index.html')));

module.exports = app;
module.exports.handler = serverless(app);
