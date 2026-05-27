console.log(((inputContent) => {
    const [firstDataLine, secondDataLine] = inputContent.trim().split('\n');
    const [upperBoundForXor] = firstDataLine.split(' ').map(BigInt);
    const numericSequence = secondDataLine.split(' ').map(BigInt);

    const initialXorValue = (upperBoundForXor <= 2n)
        ? 0n
        : numericSequence.slice(2, Number(upperBoundForXor)).reduce((accumulator, currentElement) => accumulator ^ currentElement, 0n);

    const recursiveSearch = (currentIterationIndex, searchLimit, targetXorResult, sourceSequence) => {
        if (currentIterationIndex >= searchLimit) {
            return '-1';
        }
        const computedYValue = (sourceSequence[0] - currentIterationIndex) ^ (sourceSequence[1] + currentIterationIndex);
        if (targetXorResult === computedYValue) {
            return `${currentIterationIndex}`;
        }
        return recursiveSearch(currentIterationIndex + 1n, searchLimit, targetXorResult, sourceSequence);
    };

    return recursiveSearch(0n, numericSequence[0], initialXorValue, numericSequence);

})(require('fs').readFileSync('/dev/stdin', 'utf8')));
