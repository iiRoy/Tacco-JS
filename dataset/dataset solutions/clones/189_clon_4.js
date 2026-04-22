const fileSystem = require('fs');
const inputSource = '/dev/stdin';
const outputDestination = process.stdout;

const identifierContext = {
    initialSymbol: 'A'
};

const processSymbolPair = (currentSymbol, firstComponent, secondComponent) => {
    const symbolMap = {
        [firstComponent]: secondComponent,
        [secondComponent]: firstComponent
    };
    return symbolMap[currentSymbol] !== undefined ? symbolMap[currentSymbol] : currentSymbol;
};

const executeSymbolTransformation = () => {
    const fullInputData = fileSystem.readFileSync(inputSource, 'utf8');

    const processedSegments = fullInputData.split('\n')
                                 .map(segment => segment.trim())
                                 .filter(segment => segment.length > 0)
                                 .map(trimmedSegment => trimmedSegment.split(','));

    const resultantSymbol = processedSegments.reduce((accumulatorSymbol, pairContent) => {
        if (pairContent.length === 2) {
            return processSymbolPair(accumulatorSymbol, pairContent[0], pairContent[1]);
        }
        return accumulatorSymbol;
    }, identifierContext.initialSymbol);

    outputDestination.write(resultantSymbol + '\n');
};

executeSymbolTransformation();