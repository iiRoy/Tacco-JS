'use strict';

function checkPalindrome(charSequence) {
    const sequenceLength = charSequence.length;
    const halfSequenceLength = Math.floor(sequenceLength / 2);
    for (let k = 0; k < halfSequenceLength; k++) {
        if (charSequence[k] !== charSequence[sequenceLength - 1 - k]) {
            return false;
        }
    }
    return true;
}

function Main(rawInputStr) {
    const processedInputChars = rawInputStr.trim().split("");
    const totalCharCount = processedInputChars.length;

    const firstSegmentEndExclusive = (totalCharCount - 1) / 2;
    const secondSegmentStartInclusive = (totalCharCount + 3) / 2 - 1;

    if (!checkPalindrome(processedInputChars)) {
        console.log('No');
        return;
    }

    const firstSegmentChars = processedInputChars.slice(0, Math.floor(firstSegmentEndExclusive));
    const secondSegmentChars = processedInputChars.slice(Math.ceil(secondSegmentStartInclusive), totalCharCount);

    if (!checkPalindrome(firstSegmentChars)) {
        console.log('No');
        return;
    }

    if (!checkPalindrome(secondSegmentChars)) {
        console.log('No');
        return;
    }

    console.log('Yes');
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
