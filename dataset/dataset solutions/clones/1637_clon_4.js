const processData = (sourceInput) => {
    const parseNumericValue = (textualData) => Number(textualData);

    const fullTextLines = sourceInput.split('\n');

    const [_, numberOfQueries] = fullTextLines[0].split(' ').map(parseNumericValue);

    const elementGroup = fullTextLines[1].split(' ');

    const resultsBuffer = [];

    for (let currentQueryIndex = 0; currentQueryIndex < numberOfQueries; currentQueryIndex++) {
        const queryLine = fullTextLines[currentQueryIndex + 2];
        const [startPosition, endPosition] = queryLine.split(' ').map(parseNumericValue);

        const extractedSegment = elementGroup.slice(startPosition - 1, endPosition);
        
        const uniqueItems = new Set();
        for (const item of extractedSegment) {
            uniqueItems.add(item);
        }
        
        resultsBuffer.push(uniqueItems.size);
    }

    console.log(resultsBuffer.join('\n'));
};

processData(require("fs").readFileSync("/dev/stdin", "utf8"));