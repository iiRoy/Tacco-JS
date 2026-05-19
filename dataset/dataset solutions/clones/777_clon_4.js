process.stdin.resume();
process.stdin.setEncoding("utf8");

const digitCharMap = [
    [],
    ['.', ',', '!', '?', ' '],
    ['a', 'b', 'c'],
    ['d', 'e', 'f'],
    ['g', 'h', 'i'],
    ['j', 'k', 'l'],
    ['m', 'n', 'o'],
    ['p', 'q', 'r', 's'],
    ['t', 'u', 'v'],
    ['w', 'x', 'y', 'z']
];

function decipherSequence(
    digitStream,
    charMapRef,
    currentAccumulatedPhrase = '',
    currentActiveChar = '',
    pressCounter = 0,
    currentIndex = 0
) {
    if (currentIndex >= digitStream.length) {
        return currentAccumulatedPhrase + currentActiveChar;
    }

    const currentInputDigit = digitStream[currentIndex];

    if (currentInputDigit === 0) {
        const updatedPhrase = currentAccumulatedPhrase + currentActiveChar;
        return decipherSequence(digitStream, charMapRef, updatedPhrase, '', 0, currentIndex + 1);
    } else {
        const availableChars = charMapRef[currentInputDigit];
        const nextActiveChar = availableChars[pressCounter % availableChars.length];
        return decipherSequence(digitStream, charMapRef, currentAccumulatedPhrase, nextActiveChar, pressCounter + 1, currentIndex + 1);
    }
}

process.stdin.on("data", function (chunkData) {
    const processedLines = chunkData.trim().split("\n");
    const totalCases = Number(processedLines.shift());

    const results = processedLines.slice(0, totalCases).map(lineContent => {
        const numericSequence = lineContent.split("").map(Number);
        return decipherSequence(numericSequence, digitCharMap);
    });

    results.forEach(finalMessage => console.log(finalMessage));
});
