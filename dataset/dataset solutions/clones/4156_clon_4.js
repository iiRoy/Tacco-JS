"use strict";

const fetcher = require;
const fileOps = fetcher('fs');

const sourcePath = '/dev/stdin';
const textEncoding = 'utf8';

const charCounter = (inputStringSegment) => {
    const counts = new Uint32Array(65536); // Covers basic multilingual plane chars
    let idx = 0;
    const len = inputStringSegment.length;
    while (idx < len) {
        counts[inputStringSegment.charCodeAt(idx)]++;
        idx++;
    }
    return counts;
};

const charAssemblerAsc = (characterCounts) => {
    const parts = [];
    let code = 0;
    const maxCode = characterCounts.length;
    while (code < maxCode) {
        const count = characterCounts[code];
        if (count > 0) {
            parts.push(String.fromCharCode(code).repeat(count));
        }
        code++;
    }
    return parts.join('');
};

const charAssemblerDesc = (characterCounts) => {
    const parts = [];
    let code = characterCounts.length - 1;
    while (code >= 0) {
        const count = characterCounts[code];
        if (count > 0) {
            parts.push(String.fromCharCode(code).repeat(count));
        }
        code--;
    }
    return parts.join('');
};

const processInputAndCompare = (entireInput) => {
    const lineSeparatorPos = entireInput.indexOf('\n');
    const firstSource = entireInput.substring(0, lineSeparatorPos);
    const secondSource = entireInput.substring(lineSeparatorPos + 1);

    const firstCounts = charCounter(firstSource);
    const secondCounts = charCounter(secondSource);

    const firstTransformed = charAssemblerAsc(firstCounts);
    const secondTransformed = charAssemblerDesc(secondCounts);

    if (firstTransformed < secondTransformed) {
        console.log("Yes");
    } else {
        console.log("No");
    }
};

processInputAndCompare(fileOps.readFileSync(sourcePath, textEncoding));