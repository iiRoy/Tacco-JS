let gatheredDataBuffer = '';

const processIndividualLine = (textSegment) => {
    if (!textSegment) {
        return;
    }

    const searchPattern = /(?=(JOI|IOI))/g;
    let currentMatch;
    const occurrenceCounter = { 'JOI': 0, 'IOI': 0 };

    while ((currentMatch = searchPattern.exec(textSegment)) !== null) {
        const identifiedSequence = currentMatch[1];
        if (occurrenceCounter.hasOwnProperty(identifiedSequence)) {
            occurrenceCounter[identifiedSequence]++;
        }
    }

    console.log(occurrenceCounter.JOI);
    console.log(occurrenceCounter.IOI);
};

const beginProcessing = (allInputSegments) => {
    allInputSegments.forEach(processIndividualLine);
};

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (incomingDataChunk) => {
    gatheredDataBuffer += incomingDataChunk;
});

process.stdin.on('end', () => {
    beginProcessing(gatheredDataBuffer.split('\n'));
});