'use strict';
function ProcessInput(sourceText) {
    const rawLines = sourceText.trim().split(/\r?\n/g);
    const elementCount = Number(rawLines.shift());
    const dataMatrix = rawLines.map(line => line.split(' ').map(str => Number(str)));

    const firstRowPrefixSums = dataMatrix[0].reduce((accumulator, currentVal, index) => {
        const previousSum = index > 0 ? accumulator[index - 1] : 0;
        accumulator.push(previousSum + currentVal);
        return accumulator;
    }, []);

    const secondRowSuffixSums = new Array(elementCount);
    if (elementCount > 0) {
        secondRowSuffixSums[elementCount - 1] = dataMatrix[1][elementCount - 1];
        for (let i = elementCount - 2; i >= 0; i--) {
            secondRowSuffixSums[i] = dataMatrix[1][i] + secondRowSuffixSums[i + 1];
        }
    }

    const maxCombinedSum = (elementCount === 0)
        ? 0 // Original code outputs 0 if N is 0, though N=0 would cause errors in array access.
        : Array.from({ length: elementCount }, (_, index) =>
            firstRowPrefixSums[index] + secondRowSuffixSums[index]
        ).reduce((maxVal, currentVal) => Math.max(maxVal, currentVal), -Infinity);

    console.log(maxCombinedSum);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
