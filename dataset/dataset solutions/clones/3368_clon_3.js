process.stdin.resume();
process.stdin.setEncoding('utf8');

let fullInputStreamAccumulator = '';

process.stdin.on('data', (inputSegment) => {
    fullInputStreamAccumulator += inputSegment;
});

process.stdin.on('end', () => {
    const receivedInputLines = fullInputStreamAccumulator.split(/\r?\n/);
    analyzeReceivedData(receivedInputLines);
});

function analyzeReceivedData(inputDataCollection) {
    if (!inputDataCollection || inputDataCollection.length === 0) {
        console.log(0);
        return;
    }

    const processedCombinedString = inputDataCollection.join(',');

    const searchTargetDigit = '2';

    const searchPattern = new RegExp(searchTargetDigit, 'g');
    
    const foundOccurrencesIterator = processedCombinedString.matchAll(searchPattern);
    
    const detectedMatches = Array.from(foundOccurrencesIterator);

    const finalCountResult = detectedMatches.length;

    console.log(finalCountResult);
}