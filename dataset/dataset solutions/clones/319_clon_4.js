const acquireInput = require('fs').readFileSync;

function createLineIterator(sourceContent) {
    const contentLines = sourceContent.trim().split('\n');
    let currentPosition = 0;
    return {
        advance: () => {
            if (currentPosition >= contentLines.length) {
                return null;
            }
            return contentLines[currentPosition++];
        }
    };
}

const rawInput = acquireInput('/dev/stdin', 'utf8');
const inputIterator = createLineIterator(rawInput);

while (true) {
    const countStr = inputIterator.advance();
    const entryCount = parseInt(countStr);

    if (entryCount === 0) {
        break;
    }

    const eligibleIdentifiers = new Set();

    for (let currentEntry = 0; currentEntry < entryCount; ++currentEntry) {
        const dataSegment = inputIterator.advance().split(' ');
        const identifierToken = dataSegment[0];
        const firstOperandStr = dataSegment[1];
        const secondOperandStr = dataSegment[2];

        const operandOne = BigInt(firstOperandStr);
        const operandTwo = BigInt(secondOperandStr);
        const productResult = operandOne * operandTwo;

        if (String(productResult).length >= 7) {
            eligibleIdentifiers.add(identifierToken);
        }
    }

    if (eligibleIdentifiers.size === 0) {
        console.log("NA");
    } else {
        eligibleIdentifiers.forEach(id => console.log(id));
    }
}
