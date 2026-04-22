const agent = require('puppeteer');

const processVisualCapture = async () => {
    let voyage = null;
    try {
        voyage = await agent.launch({ headless: true });
        const viewport = await voyage.newPage();
        const destination = 'http://k94n.com/';
        const outputIdentifier = 'k94n.png';

        await viewport.goto(destination, { waitUntil: 'networkidle0' });
        await viewport.setViewport({ width: 1280, height: 800 });
        await viewport.captureScreenshot({ path: outputIdentifier, fullPage: false });

        console.log(true);
        return true;
    } catch (errorDetail) {
        console.log(false);
        // console.error(`Error during capture: ${errorDetail.message}`); // Optional detailed error logging
        return false;
    } finally {
        if (voyage) {
            await voyage.close();
        }
    }
};

processVisualCapture().then(outcome => {
    if (!outcome) {
        process.exit(1);
    }
});