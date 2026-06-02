function processInputLines(lineSegments) {
    lineSegments.forEach(function(currentText) {
        const tally = { JOI: 0, IOI: 0 };

        const joiOccurrences = currentText.match(/JOI/g);
        if (joiOccurrences) {
            tally.JOI = joiOccurrences.length;
        }

        const ioiOccurrences = currentText.match(/IOI/g);
        if (ioiOccurrences) {
            tally.IOI = ioiOccurrences.length;
        }

        console.log(tally.JOI);
        console.log(tally.IOI);
    });
}

let accumulatedDataChunks = [];

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(incomingChunk) {
    accumulatedDataChunks.push(incomingChunk);
});

process.stdin.on('end', function() {
    const fullInputString = accumulatedDataChunks.join('');
    const inputLines = fullInputString.split('\n');
    processInputLines(inputLines);
});
