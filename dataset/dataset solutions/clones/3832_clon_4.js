let receivedData = '';
process.stdin.on('data', (inputSegment) => {
    receivedData += inputSegment.toString();
});

process.stdin.on('end', () => {
    const dataChunks = receivedData.trim().split('\n');
    const sourceSequence = dataChunks[0];
    const targetIndex = Number(dataChunks[1]);

    const uniqueSegments = new Set();
    for (let currentStart = 0; currentStart < sourceSequence.length; ++currentStart) {
        for (let currentEnd = currentStart; currentEnd < sourceSequence.length; ++currentEnd) {
            const extractedPortion = sourceSequence.substring(currentStart, currentEnd + 1);
            if (extractedPortion.length <= targetIndex) {
                uniqueSegments.add(extractedPortion);
            }
        }
    }

    const orderedCollection = Array.from(uniqueSegments).sort();

    console.log(orderedCollection[targetIndex - 1]);
});