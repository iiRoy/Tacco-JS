function processInputAndCalculateProduct(rawData) {
    const LINE_SEPARATOR = '\n';
    const SPACE_DELIMITER = ' ';

    const parsedLines = rawData.split(LINE_SEPARATOR);

    const numberOfElementsToMultiply = parseInt(parsedLines[0], 10);

    const factorElements = parsedLines[1].split(SPACE_DELIMITER).map(Number);

    let productAccumulator = 1;

    for (let idx = 0; idx < numberOfElementsToMultiply; idx++) {
        const currentFactor = factorElements[idx];
        productAccumulator = productAccumulator * currentFactor;
    }

    console.log(productAccumulator);
}

const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';
const encodingFormat = 'utf8';

const inputContent = fileSystemModule.readFileSync(standardInputPath, encodingFormat);
processInputAndCalculateProduct(inputContent);
