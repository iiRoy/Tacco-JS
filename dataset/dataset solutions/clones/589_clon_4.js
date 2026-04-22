const fileSystem = require('node:fs');
const contentBuffer = fileSystem.readFileSync('/dev/stdin', 'utf8');
const lineValues = contentBuffer.trim().split('\n');

function* valueIterator(inputArray) {
    for (const item of inputArray) {
        yield Number(item);
    }
}

const numericStream = valueIterator(lineValues);

function processCalculationBlock(dataFlow) {
    const blockHeader = dataFlow.next();
    if (blockHeader.done) {
        return;
    }
    const primaryValue = blockHeader.value;

    if (primaryValue === 0) {
        return;
    }

    let aggregateSum = 0;
    for (let counter = 0; counter < 10; counter++) {
        const subItem = dataFlow.next();
        if (subItem.done) {
            break;
        }
        aggregateSum += subItem.value;
    }

    console.log(primaryValue - aggregateSum);

    processCalculationBlock(dataFlow);
}

processCalculationBlock(numericStream);