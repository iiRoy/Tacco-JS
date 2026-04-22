const initialData = require('fs').readFileSync('/dev/stdin', 'utf8').trimEnd();
const [lengthStr, firstSeq, secondSeq, thirdSeq] = initialData.split('\n');
const sequenceCount = Number(lengthStr);

const firstArray = [...firstSeq];
const secondArray = [...secondSeq];
const thirdArray = [...thirdSeq];

const determineMismatchValue = (val1, val2, val3) => {
    const distinctElements = new Set([val1, val2, val3]);
    return distinctElements.size - 1;
};

const positions = Array.from({ length: sequenceCount }, (_, k) => k);

const finalTally = positions.reduce((currentTally, positionIndex) => {
    const charA = firstArray[positionIndex];
    const charB = secondArray[positionIndex];
    const charC = thirdArray[positionIndex];
    return currentTally + determineMismatchValue(charA, charB, charC);
}, 0);

console.log(finalTally);