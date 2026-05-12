const puppeteer = require('puppeteer');

// Use an environment variable or change 'hasantd' to your ID
const TARGET_ID = process.env.APARAT_ID || 'hasantd';

async function startViewer() {
    console.log(`[${new Date().toLocaleTimeString()}] Initializing viewer for: ${TARGET_ID}`);

    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage', // Critical for cloud environments
            '--disable-gpu',
            '--mute-audio',
            '--no-zygote',
            '--single-process' // Saves memory in containers
        ]
    });

    const page = await browser.newPage();

    // OPTIMIZATION: Block images and fonts to save RAM/Bandwidth on Runflare
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if (['image', 'font', 'stylesheet'].includes(req.resourceType()) && req.url().includes('aparat')) {
            // We only block images/fonts. We keep scripts so the player works.
            req.abort();
        } else {
            req.continue();
        }
    });

    try {
        const url = `https://www.aparat.com/${TARGET_ID}/live`;
        console.log(`Navigating to ${url}...`);

        await page.goto(url, { 
            waitUntil: 'networkidle2', 
            timeout: 0 
        });

        // Check if the stream is active every 5 minutes
        setInterval(async () => {
            const title = await page.title();
            console.log(`[${new Date().toLocaleTimeString()}] Status: Active - ${title}`);
        }, 300000);

    } catch (err) {
        console.error("Error during execution:", err);
        await browser.close();
        process.exit(1); // Restart the container on error
    }
}

startViewer();
