function processDataStream(streamData) {
    const allRecords = streamData.split('\n');

    const relevantRecords = allRecords.reduce((accumulator, currentRecord) => {
        const partsOfRecord = currentRecord.split(' ');
        const isSentinel = partsOfRecord.length === 2 &&
                           Number(partsOfRecord[0]) === 0 &&
                           Number(partsOfRecord[1]) === 0;

        if (accumulator.stopProcessing || isSentinel) {
            accumulator.stopProcessing = true;
        } else {
            accumulator.collectedData.push(currentRecord);
        }
        return accumulator;
    }, { collectedData: [], stopProcessing: false }).collectedData;

    const formattedRecords = relevantRecords.map(recordText => {
        const components = recordText.split(' ');
        // Replicate the original's lexicographical sort (e.g., [10, 2] sorts to [10, 2], [5, 1] sorts to [1, 5])
        components.sort();
        return components.join(' ');
    });

    const finalOutputText = formattedRecords.join('\n');

    // The original code appends a newline after each processed line's string,
    // meaning the final output string will end with a newline if any lines were processed.
    // To replicate this, if the formatted text is not empty, append a final newline.
    if (formattedRecords.length > 0) {
        console.log(finalOutputText + '\n');
    } else {
        // If no records were processed (e.g., input is "0 0" or an empty string), output an empty string.
        console.log('');
    }
}

processDataStream(require('node:fs').readFileSync('/dev/stdin', 'utf8'));