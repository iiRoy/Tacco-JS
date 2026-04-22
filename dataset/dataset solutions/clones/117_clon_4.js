let collectedInput = '';

process.stdin.on('data', (dataChunk) => {
    collectedInput += dataChunk.toString();
});

process.stdin.on('end', () => {
    const parsedSegments = collectedInput.trim().split(' ');
    
    const finalResult = parsedSegments.reduce((currentAccumulator, currentElement) => {
        // Frequency and most frequent item logic
        const presentCount = (currentAccumulator.frequencyMap.get(currentElement) || 0) + 1;
        currentAccumulator.frequencyMap.set(currentElement, presentCount);

        if (presentCount > currentAccumulator.highestFrequency) {
            currentAccumulator.highestFrequency = presentCount;
            currentAccumulator.topFrequencyItem = currentElement;
        }

        // Longest item logic
        const elementLength = currentElement.length;
        if (elementLength > currentAccumulator.maximumLength) {
            currentAccumulator.maximumLength = elementLength;
            currentAccumulator.longestElement = currentElement;
        }

        return currentAccumulator;
    }, {
        frequencyMap: new Map(),
        highestFrequency: 0,
        topFrequencyItem: '',
        maximumLength: 0,
        longestElement: ''
    });

    console.log(finalResult.topFrequencyItem + ' ' + finalResult.longestElement);
});