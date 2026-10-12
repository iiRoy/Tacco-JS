const inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});

let inputLines = [];
let inputHandler;

inputReader.on('line', (line) => {
    inputLines.push(line);
});

inputReader.on('close', () => {
    inputHandler = createInputHandler(inputLines);
    console.error('\n↑入力 ↓出力');
    processMainLogic();
});

function deepCopy(sourceObject) {
    return (sourceObject instanceof Set) ? new Set(Array.from(sourceObject)) : JSON.parse(JSON.stringify(sourceObject));
}

function readInt() {
    return convertInput(getNextToken(), 1);
}

function readStrArray() {
    return convertInput(getNextToken(), 2);
}

function readIntArray() {
    return convertInput(getNextToken(), 4);
}

function readCharArray() {
    return convertInput(getNextToken(), 6);
}

function getNextToken() {
    return inputHandler.retrieveNext();
}

function hasMoreTokens() {
    return inputHandler.hasMore();
}

function createInputHandler(lines) {
    let currentLineIndex = 0;
    const totalLineCount = lines.length;

    return {
        hasMore: () => currentLineIndex < totalLineCount,
        retrieveNext: () => {
            if (currentLineIndex < totalLineCount) {
                return lines[currentLineIndex++];
            } else {
                throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
            }
        }
    };
}

function printOutput(content) {
    console.log(content);
}

function printDebug(content) {
    console.error('debug:' + require('util').inspect(content, false, null));
}

function convertInput(inputValue, conversionType) {
    try {
        switch (conversionType) {
            case 1: return parseInt(inputValue);
            case 2: return inputValue.split(' ');
            case 4: return inputValue.split(' ').map(Number);
            case 6: return inputValue.split('');
            case 7: return inputValue.split('').map(Number);
            case 8: return inputValue.join(' ');
            case 9: return inputValue.join('\n');
            case 0: return inputValue.join('');
            default: return inputValue;
        }
    } catch (e) {
        return inputValue;
    }
}

const MAX_BIT_POSITION = 10;

function checkBitDifference(valueA, valueB, bitPos) {
    const xorResult = valueA ^ valueB;
    return ((xorResult >> bitPos) & 1) === 1;
}

function processMainLogic() {
    const numElements = readInt();

    for (let i = 0; i < numElements - 1; ++i) {
        for (let j = i + 1; j < numElements; ++j) {
            const differingBitPositions = [];

            for (let k = 0; k < MAX_BIT_POSITION; ++k) {
                if (checkBitDifference(i, j, k)) {
                    differingBitPositions.push(k + 1);
                }
            }
            printOutput(convertInput(differingBitPositions, 8));
        }
    }
}
