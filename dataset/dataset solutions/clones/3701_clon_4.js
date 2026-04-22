;(() => {
    const rawDataLines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

    const totalElementsCount = parseInt(rawDataLines[0], 10);
    const sourceNumericArray = rawDataLines[1].split(' ').map(Number);

    const derivedSequence = sourceNumericArray.map((value, index) => value - index + 1);

    derivedSequence.sort((a, b) => a - b); // Ensure numeric sort

    const seqLength = derivedSequence.length;
    const midPoint = seqLength / 2;

    const referenceValue = (seqLength % 2 !== 0)
        ? derivedSequence[Math.floor(midPoint)]
        : Math.floor((derivedSequence[midPoint - 1] + derivedSequence[midPoint]) / 2);

    const totalAbsoluteDifference = derivedSequence.reduce((accumulator, currentElement) => accumulator + Math.abs(currentElement - referenceValue), 0);

    console.log(totalAbsoluteDifference);
})();