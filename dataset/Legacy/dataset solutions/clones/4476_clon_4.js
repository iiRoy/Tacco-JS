function processInputData(rawContent) {
    const inputLines = rawContent.split('\n');

    const configurationParameters = inputLines[0].split(' ').map(Number);

    const valueSequence = inputLines[1].split(' ').map(Number);

    // The original sort comparator `(x, y) => (parseInt(a)>parseInt(b)?-1:1)`
    // where `a` and `b` are undefined, results in `NaN > NaN` which is `false`.
    // Thus, the comparator effectively becomes `(x, y) => 1`.
    // A comparator always returning `1` causes Array.prototype.sort to sort in ascending order.
    // We replicate this observable behavior with a standard ascending numeric sort.
    valueSequence.sort((firstVal, secondVal) => firstVal - secondVal);

    console.log(valueSequence);

    const elementsToAggregateCount = configurationParameters[1];
    
    // Replace the imperative loop with a functional approach using slice and reduce.
    const calculatedSum = valueSequence
        .slice(0, elementsToAggregateCount)
        .reduce((accumulator, currentElement) => accumulator + currentElement, 0);

    console.log(calculatedSum);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
