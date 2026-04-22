function acquireSourceMaterial() {
    const fileSystemBridge = require('node:fs');
    const contentBuffer = fileSystemBridge.readFileSync('/dev/stdin', 'utf8');
    return contentBuffer.trim();
}

function processInputValues(textualDataStream) {
    const segments = textualDataStream.split(' ');
    const uniqueSegmentSet = new Set(segments);

    if (uniqueSegmentSet.size === 2) {
        displayResult('Yes');
    } else {
        displayResult('No');
    }
}

function displayResult(outputMessage) {
    console.log(outputMessage);
}

const rawInputContent = acquireSourceMaterial();
processInputValues(rawInputContent);