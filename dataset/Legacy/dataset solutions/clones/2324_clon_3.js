'use strict';

const NEWLINE_SEPARATOR = '\n';
const WORD_SEPARATOR = ' ';

const processInputData = (rawInputContent) => {
    const inputLines = rawInputContent.split(NEWLINE_SEPARATOR);
    const loopIterationsStr = inputLines[0];
    const totalIterations = parseInt(loopIterationsStr, 10);

    const stringSegments = inputLines[1].split(WORD_SEPARATOR);
    const primaryString = stringSegments[0];
    const secondaryString = stringSegments[1];

    const interleavedCharacters = [];

    for (let currentIdx = 0; currentIdx < totalIterations; currentIdx++) {
        const charFromPrimary = primaryString[currentIdx];
        const charFromSecondary = secondaryString[currentIdx];
        interleavedCharacters.push(charFromPrimary);
        interleavedCharacters.push(charFromSecondary);
    }

    const finalResultString = interleavedCharacters.join('');
    console.log(finalResultString);
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
