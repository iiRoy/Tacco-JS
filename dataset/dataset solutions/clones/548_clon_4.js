let rawInputBuffer = '';

function processInputData() {
    const allInputLines = rawInputBuffer.split('\n');

    const entryCount = parseInt(allInputLines[0], 10);

    const dataSegments = allInputLines.slice(1, entryCount + 1);

    const finalAccumulations = dataSegments.reduce((currentTotals, currentSegment) => {
        const [valA, valB] = currentSegment.split(' ').map(parseFloat);

        const [deltaFirst, deltaSecond] =
            (valA > valB) ? [valA + valB, 0] :
            (valA < valB) ? [0, valA + valB] :
            [valA, valB];

        return {
            firstAcc: currentTotals.firstAcc + deltaFirst,
            secondAcc: currentTotals.secondAcc + deltaSecond
        };
    }, { firstAcc: 0, secondAcc: 0 });

    console.log("%d %d", finalAccumulations.firstAcc, finalAccumulations.secondAcc);
}

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
    rawInputBuffer += chunk;
});
process.stdin.on('end', function() {
    processInputData();
});
