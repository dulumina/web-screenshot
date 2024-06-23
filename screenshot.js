const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5601;

app.use(express.json());

app.post('/screenshot', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).send('URL is required');
    }

    try {
        const browser = await puppeteer.launch({
            headless: 'new', // Gunakan headless mode baru
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });

        const screenshotPath = path.join(__dirname, 'screenshot.png');
        await page.screenshot({ path: screenshotPath });

        await browser.close();

        res.sendFile(screenshotPath, (err) => {
            if (err) {
                res.status(500).send('Error sending the file');
            } else {
                fs.unlinkSync(screenshotPath); // Hapus file setelah dikirim
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while taking the screenshot');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

