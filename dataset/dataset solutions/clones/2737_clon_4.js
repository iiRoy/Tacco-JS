const transformProcessor = (linesOfInput) => {
    const elementCount = Number.parseInt(linesOfInput[0]);
    const baseValues = linesOfInput[1].split(' ').map(Number.parseInt);

    const finalValueArray = Array(elementCount);

    const computeCurrentItem = (indexPosition) => {
        if (indexPosition < 0) {
            return;
        }

        let currentDataItem = baseValues[indexPosition];
        const currentDivisorCheck = indexPosition + 1;

        const xorContributions = Array.from({ length: elementCount - (indexPosition + 1) }, (_, offset) => offset + indexPosition + 1)
            .filter(subsequentPosition => (subsequentPosition + 1) % currentDivisorCheck === 0)
            .reduce((accumulator, subsequentPosition) => accumulator ^ finalValueArray[subsequentPosition], 0);

        finalValueArray[indexPosition] = currentDataItem ^ xorContributions;

        computeCurrentItem(indexPosition - 1);
    };

    computeCurrentItem(elementCount - 1);

    return finalValueArray;
};

const inputSource = require('fs').readFileSync('/dev/stdin', 'UTF-8').split('\n');
const processedResults = transformProcessor(inputSource);

const activeOnes = processedResults.filter(val => val === 1);
const countActive = activeOnes.length;

console.log(countActive);
if (countActive > 0) {
    console.log(activeOnes.join(' '));
}