function processInput(dataSource) {
    const parsedLines = dataSource.split('\n');
    const countOfEntries = parseInt(parsedLines[0], 10);
    console.log(countOfEntries);

    const processedPairs = parsedLines.slice(1, countOfEntries + 1).map(lineText => {
        const lineFragments = lineText.split(' ').map(Number);
        return { firstElement: lineFragments[0], secondElement: lineFragments[1] };
    });

    const intermediateState = processedPairs.reduce((accumulatorState, elementPair) => {
        let { componentX, componentY } = accumulatorState;
        const { firstElement, secondElement } = elementPair;

        const factorOne = componentX / firstElement;
        const factorTwo = componentY / secondElement;

        const finalMultiplier = Math.max(1, Math.ceil(Math.max(factorOne, factorTwo)));

        componentX = firstElement * finalMultiplier;
        componentY = secondElement * finalMultiplier;
        
        return { componentX, componentY };
    }, { componentX: 0, componentY: 0 });

    const totalSum = intermediateState.componentX + intermediateState.componentY;
    console.log(totalSum + '\n');
}

function ioProcessor(fileSystemReader) {
    const contentString = fileSystemReader('/dev/stdin', 'utf8');
    processInput(contentString);
}

ioProcessor(require('fs').readFileSync);