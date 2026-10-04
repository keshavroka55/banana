const fs = require("fs");
const path = require("path");

const API_URL = "https://marcconrad.com/uob/banana/api.php";

const OUTPUT_DIR = path.join(__dirname, "banana-images");
const JSON_FILE = path.join(__dirname, "banana-images.json");

// How many API requests to make
const MAX_REQUESTS = 10000;

// Stop after this many requests without discovering a new image
const MAX_NO_NEW = 1000;

// Delay between requests (milliseconds)
const DELAY = 100;

const images = new Map();

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getQuestion() {
    const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
}

async function downloadImage(url, id) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to download image: HTTP ${response.status}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    const extension = path.extname(new URL(url).pathname) || ".png";

    const filename = `${id}${extension}`;

    fs.writeFileSync(
        path.join(OUTPUT_DIR, filename),
        buffer
    );

    return filename;
}

async function main() {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    let noNewCount = 0;

    for (let i = 1; i <= MAX_REQUESTS; i++) {
        try {
            const data = await getQuestion();

            const imageUrl = data.question;
            const solution = data.solution;

            if (!imageUrl) {
                console.log("Invalid response:", data);
                continue;
            }

            if (!images.has(imageUrl)) {
                images.set(imageUrl, {
                    id: images.size + 1,
                    imageUrl,
                    solution
                });

                const filename = await downloadImage(
                    imageUrl,
                    images.size
                );

                images.get(imageUrl).filename = filename;

                noNewCount = 0;

                console.log(
                    `[NEW ${images.size}] Solution: ${solution}\n${imageUrl}\n`
                );
            } else {
                noNewCount++;

                console.log(
                    `[${i}] Duplicate (${noNewCount}/${MAX_NO_NEW})`
                );
            }

            // Save progress after every request
            saveResults();

            // Stop if we haven't found anything new for a while
            if (noNewCount >= MAX_NO_NEW) {
                console.log("\nNo new images found for a long time.");
                console.log("Assuming the dataset has been discovered.");
                break;
            }

            await sleep(DELAY);

        } catch (error) {
            console.error(`Request ${i} failed:`, error.message);

            // Don't immediately stop because of one failed request
            await sleep(1000);
        }
    }

    console.log("\n==============================");
    console.log("Finished");
    console.log("==============================");
    console.log(`Unique images: ${images.size}`);
    console.log(`Saved to: ${JSON_FILE}`);
}

function saveResults() {
    const data = Array.from(images.values());

    fs.writeFileSync(
        JSON_FILE,
        JSON.stringify(data, null, 2)
    );
}

main();