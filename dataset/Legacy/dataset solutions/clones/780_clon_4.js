let allInputData = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
    allInputData += chunk;
});

process.stdin.on('end', () => {
    const processedLines = allInputData.split('\n');
    executeProgram(processedLines);
});

const keyCharRegistry = new Map([
    [1, ['.', ' ,' , '!' , '?', ' ']],
    [2, ['a', 'b', 'c']],
    [3, ['d', 'e', 'f']],
    [4, ['g', 'h', 'i']],
    [5, ['j', 'k', 'l']],
    [6, ['m', 'n', 'o']],
    [7, ['p', 'q', 'r', 's']],
    [8, ['t', 'u', 'v']],
    [9, ['w', 'x', 'y', 'z']]
]);

const decodeSequenceReducer = (accumulator, currentCharacter) => {
    const { currentKey, pressCount, decodedSegments } = accumulator;

    if (currentCharacter === '0') {
        if (pressCount > 0) {
            const characterSet = keyCharRegistry.get(Number(currentKey));
            if (characterSet) {
                decodedSegments.push(characterSet[(pressCount - 1) % characterSet.length]);
            }
        }
        return { currentKey: null, pressCount: 0, decodedSegments };
    } else {
        if (currentCharacter === currentKey) {
            return { currentKey, pressCount: pressCount + 1, decodedSegments };
        } else {
            return { currentKey: currentCharacter, pressCount: 1, decodedSegments };
        }
    }
};

function processKeypadString(inputSequence) {
    const finalState = Array.from(inputSequence).reduce(decodeSequenceReducer, {
        currentKey: null,
        pressCount: 0,
        decodedSegments: []
    });
    return finalState.decodedSegments.join('');
}

function executeProgram(dataLines) {
    const numberOfCases = Number(dataLines[0]);
    dataLines.slice(1, numberOfCases + 1)
             .map(processKeypadString)
             .forEach(console.log);
}
