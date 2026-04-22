function processDataStream(streamPayload) {
    const dataSegments = streamPayload.split('\n');

    let currentLineIndex = 0;

    const initialCount = Number(dataSegments[currentLineIndex++]);

    const primaryCollection = dataSegments[currentLineIndex++].split(' ', initialCount).map(val => Number(val));

    const queryCount = Number(dataSegments[currentLineIndex++]);

    const queryCollection = dataSegments[currentLineIndex++].split(' ', queryCount).map(val => Number(val));

    const uniqueSourceValues = new Set(primaryCollection);

    const matchedItems = queryCollection.filter(item => uniqueSourceValues.has(item));

    console.log(matchedItems.length);
}

processDataStream(require('fs').readFileSync('/dev/stdin', 'utf8'));