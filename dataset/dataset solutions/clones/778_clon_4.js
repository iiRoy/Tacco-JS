const keyToCharMap = {
    '1': ['.', ',', '!', '?', ' '],
    '2': ['a', 'b', 'c'],
    '3': ['d', 'e', 'f'],
    '4': ['g', 'h', 'i'],
    '5': ['j', 'k', 'l'],
    '6': ['m', 'n', 'o'],
    '7': ['p', 'q', 'r', 's'],
    '8': ['t', 'u', 'v'],
    '9': ['w', 'x', 'y', 'z']
};

function _recursiveCharacterAssembler(remainingSequence, activeKey, successivePressCount, acquiredCharacters) {
    if (remainingSequence.length === 0) {
        return acquiredCharacters.join('');
    }

    const nextSymbol = remainingSequence[0];
    const sequenceRemainder = remainingSequence.substring(1);

    if (nextSymbol === '0') {
        if (activeKey !== null && successivePressCount > 0) {
            const symbolSet = keyToCharMap[activeKey];
            const symbolIndex = (successivePressCount - 1) % symbolSet.length;
            acquiredCharacters.push(symbolSet[symbolIndex]);
        }
        return _recursiveCharacterAssembler(sequenceRemainder, null, 0, acquiredCharacters);
    } else { // nextSymbol is a digit from '1' to '9'
        if (activeKey === null || activeKey !== nextSymbol) {
            return _recursiveCharacterAssembler(sequenceRemainder, nextSymbol, 1, acquiredCharacters);
        } else {
            return _recursiveCharacterAssembler(sequenceRemainder, activeKey, successivePressCount + 1, acquiredCharacters);
        }
    }
}

function decodeInputSequence(transmission) {
    return _recursiveCharacterAssembler(transmission, null, 0, []);
}

function initiateProcessing(allLines) {
    const totalInputTests = parseInt(allLines[0], 10);
    const testCases = allLines.slice(1, totalInputTests + 1);

    const decodedOutputs = testCases.map(sequence => decodeInputSequence(sequence));

    decodedOutputs.forEach(resultLine => console.log(resultLine));
}

let gatheredPayload = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (fragment) => {
    gatheredPayload += fragment;
});
process.stdin.on('end', () => {
    const segmentedPayload = gatheredPayload.split('\n');
    initiateProcessing(segmentedPayload);
});