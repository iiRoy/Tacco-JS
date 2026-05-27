const fs = require('fs');

const MODULUS_CONSTANT = 1000000007;

function computeRemainderCounts(inputSequence) {
    const initialCounts = Array(13).fill(0);
    initialCounts[0] = 1;

    const finalCounts = inputSequence.split('').reduce((currentRemainderCounts, charValue) => {
        const nextRemainderCounts = Array(13).fill(0);

        for (let previousRemainder = 0; previousRemainder < 13; previousRemainder++) {
            if (currentRemainderCounts[previousRemainder] === 0) continue;

            if (charValue === '?') {
                for (let currentDigit = 0; currentDigit < 10; currentDigit++) {
                    const newRemainder = (previousRemainder * 10 + currentDigit) % 13;
                    nextRemainderCounts[newRemainder] = (nextRemainderCounts[newRemainder] + currentRemainderCounts[previousRemainder]) % MODULUS_CONSTANT;
                }
            } else {
                const currentDigit = Number(charValue);
                const newRemainder = (previousRemainder * 10 + currentDigit) % 13;
                nextRemainderCounts[newRemainder] = (nextRemainderCounts[newRemainder] + currentRemainderCounts[previousRemainder]) % MODULUS_CONSTANT;
            }
        }
        return nextRemainderCounts;
    }, initialCounts);

    return finalCounts[5];
}

function processInputContent(rawInputString) {
    const trimmedAndSplit = rawInputString.trim().split(/\s+/g);
    const targetSequence = trimmedAndSplit[0];
    return computeRemainderCounts(targetSequence);
}

const standardInputData = fs.readFileSync("/dev/stdin", "utf8");
const finalResult = processInputContent(standardInputData);
console.log(finalResult);
