'use strict';

const processInput = rawData => {
    const lines = rawData.split('\n');
    const charCount = Number(lines[0]);
    const stringPair = lines[1].split(' ');
    const strA = stringPair[0];
    const strB = stringPair[1];

    const interleavedChars = Array.from({ length: charCount }, (_, idx) => {
        return strA.charAt(idx) + strB.charAt(idx);
    });

    const resultString = interleavedChars.join('');
    console.log(resultString);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
