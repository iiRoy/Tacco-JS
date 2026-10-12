const computeDigitTotal = (numericInput) => {
    let runningSum = 0;
    let temporaryNumber = numericInput;
    while (temporaryNumber > 0) {
        runningSum += temporaryNumber % 10;
        temporaryNumber = Math.floor(temporaryNumber / 10);
    }
    return runningSum;
};

(function(rawInput) {
    const lineSegments = rawInput.split('\n');

    const terminationPoint = lineSegments.findIndex(segment => Number(segment) === 0);

    const activeSegments = terminationPoint === -1
        ? lineSegments
        : lineSegments.slice(0, terminationPoint);

    activeSegments.forEach(segment => {
        const numericRepresentation = Number(segment);
        console.log(computeDigitTotal(numericRepresentation));
    });

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
