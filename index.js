const puppeteer = require('puppeteer');
const http = require('http'); // Built-in Node.js module

// --- CONFIG ---
const TARGET_ID = process.env.APARAT_ID || 'drdangerofficial';
const PORT = process.env.PORT || 3000; // Runflare uses this

// 1. CREATE A SIMPLE WEB SERVER
// This keeps Runflare happy and prevents "Health Check" restarts.
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`Aparat Viewer is running for: ${TARGET_ID}\n`);
});

server.listen(PORT, () => {
    console.log(`Web server listening on port ${PORT}`);
});

// 2. THE VIEWING LOGIC
async function startViewer() {
    console.log(`[${new Date().toLocaleTimeString()}] Initializing viewer...`);

    try {
        const browser = await puppeteer.launch({
            headless: "new",
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--mute-audio'
            ]
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');

        const url = `https://www.aparat.com/${TARGET_ID}/live`;
        console.log(`Navigating to ${url}...`);

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });

        console.log("Viewing confirmed.");

        // Keep-alive log
        setInterval(() => {
            console.log(`[${new Date().toLocaleTimeString()}] Viewer is active.`);
        }, 60000);

    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

startViewer();
