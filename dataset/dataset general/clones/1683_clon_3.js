const getModule = require;

let renderingSurface = getModule('webpage').create();
const executionEnvironment = getModule('system');

let sourceUrl;
let outputFile;
let documentDimensions;

const defaultViewWidth = 5000;
const renderDelayAfterLoad = 200;

const logActivity = (messageText, isError = false) => {
    if (isError) {
        console.error(`[CRITICAL] ${messageText}`);
    } else {
        console.log(`[INFO] ${messageText}`);
    }
};

const commandLineParams = executionEnvironment.args;
const parameterCount = commandLineParams.length;

const minRequiredArgs = 3;
const maxAllowedArgs = 5;

if (parameterCount < minRequiredArgs || parameterCount > maxAllowedArgs) {
    logActivity('Incorrect number of command-line arguments provided.', true);
    logActivity('Usage: renderingEngine.js <target_URL> <output_file> [paper_size|dimensions] [zoom_factor]');
    logActivity('  Example paper formats: "A4", "Letter", or "10cm*20cm" for custom sizes.');
    phantom.exit(1);
}

sourceUrl = commandLineParams[1];
outputFile = commandLineParams[2];

renderingSurface.viewDimensions = { width: defaultViewWidth };

const isPdfOutputFormat = outputFile.toLowerCase().endsWith('.pdf');
const hasPrintSettings = parameterCount > 3;

if (hasPrintSettings && isPdfOutputFormat) {
    const rawPrintSetting = commandLineParams[3];
    const dimensionSegments = rawPrintSetting.split('*');

    if (dimensionSegments.length === 2) {
        documentDimensions = {
            width: dimensionSegments[0],
            height: dimensionSegments[1],
            margin: '0px'
        };
    } else {
        documentDimensions = {
            format: rawPrintSetting,
            orientation: 'portrait',
            margin: '1cm'
        };
    }
    renderingSurface.printSettings = documentDimensions;
}

const hasMagnificationRatio = parameterCount > 4;
let finalMagnification = 1.0;

if (hasMagnificationRatio) {
    const parsedZoom = parseFloat(commandLineParams[4]);
    if (!isNaN(parsedZoom) && parsedZoom > 0) {
        finalMagnification = parsedZoom;
    } else {
        logActivity('Invalid magnification factor provided. Using default (1.0).', true);
    }
}
renderingSurface.magnificationRatio = finalMagnification;

renderingSurface.onPageConsoleMessage = function(...args) {
    logActivity(`PAGE_LOG: ${args.join(' ')}`);
};

renderingSurface.openUrl(sourceUrl, function (loadResult) {
    if (loadResult !== 'success') {
        logActivity(`Failed to load web content from: ${sourceUrl}`, true);
        phantom.exit(1);
    } else {
        window.setTimeout(() => {
            try {
                renderingSurface.saveSnapshot(outputFile);
                logActivity(`Successfully saved snapshot to: ${outputFile}`);
                phantom.exit(0);
            } catch (snapshotError) {
                logActivity(`An error occurred during snapshot generation: ${snapshotError.message}`, true);
                phantom.exit(1);
            }
        }, renderDelayAfterLoad);
    }
});