let textCollector = '';

process.stdin.on('data', (chunkOfData) => {
    textCollector += chunkOfData.toString();
});

process.stdin.on('end', () => {
    let lineProcessor = '';
    for (let charPosition = 0; charPosition < textCollector.length; charPosition++) {
        let currentCharacter = textCollector[charPosition];
        if (currentCharacter === '\n') {
            let processedNumericValue = +lineProcessor;
            process.stdout.write(processedNumericValue + '\n');
            lineProcessor = '';
        } else {
            lineProcessor += currentCharacter;
        }
    }
    if (lineProcessor.length > 0) {
        let processedNumericValue = +lineProcessor;
        process.stdout.write(processedNumericValue + '\n');
    }
});