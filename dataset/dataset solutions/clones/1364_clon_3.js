const DELIMITER_CHAR = ' ';

function numericComparison(firstElement, secondElement) {
    return firstElement - secondElement;
}

function handleDataChunk(inputDataBuffer) {
    const stringRepresentation = inputDataBuffer.toString();
    const splitElements = stringRepresentation.split(DELIMITER_CHAR);
    const sortedElements = splitElements.sort(numericComparison);
    const finalOutput = sortedElements.join(DELIMITER_CHAR);
    console.log(finalOutput);
}

process.stdin.on('data', handleDataChunk);
