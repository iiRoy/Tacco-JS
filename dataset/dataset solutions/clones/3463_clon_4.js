const obtainInteger = (txtVal) => Number.parseInt(txtVal, 10);

const determineMaximum = (valA, valB) => {
    if (valA > valB) {
        return valA;
    }
    return valB;
};

const executeCalculation = (rawInputContent) => {
    const inputLines = rawInputContent.split('\n');
    const elementQuantity = obtainInteger(inputLines[0]);
    
    const numericSequence = inputLines.slice(1, elementQuantity + 1)
                                      .map(obtainInteger)
                                      .sort((val1, val2) => val1 - val2);

    let candidateOneResult;
    let candidateTwoResult;

    if (elementQuantity % 2 === 0) {
        const centralDivisionPoint = elementQuantity / 2;
        
        const sumOfLowerSegment = numericSequence.slice(0, centralDivisionPoint).reduce((accum, current) => accum + current, 0);
        const sumOfUpperSegmentExcludingMiddle = numericSequence.slice(centralDivisionPoint + 2).reduce((accum, current) => accum + current, 0);
        
        candidateOneResult = (-2 * sumOfLowerSegment) +
                             (3 * numericSequence[centralDivisionPoint]) +
                             (1 * numericSequence[centralDivisionPoint + 1]) +
                             (2 * sumOfUpperSegmentExcludingMiddle);
        
        candidateTwoResult = 0;
    } else {
        const medianElementIndex = (elementQuantity - 1) / 2;

        const sumOfFirstPartForX = numericSequence.slice(0, medianElementIndex).reduce((accum, current) => accum + current, 0);
        const sumOfSecondPartForX = numericSequence.slice(medianElementIndex + 2).reduce((accum, current) => accum + current, 0);
        candidateOneResult = (-2 * sumOfFirstPartForX) +
                             (1 * numericSequence[medianElementIndex]) +
                             (1 * numericSequence[medianElementIndex + 1]) +
                             (2 * sumOfSecondPartForX);

        const sumOfFirstPartForY = numericSequence.slice(0, medianElementIndex - 1).reduce((accum, current) => accum + current, 0);
        const sumOfSecondPartForY = numericSequence.slice(medianElementIndex + 1).reduce((accum, current) => accum + current, 0);
        candidateTwoResult = (-2 * sumOfFirstPartForY) +
                             (-1 * numericSequence[medianElementIndex - 1]) +
                             (-1 * numericSequence[medianElementIndex]) +
                             (2 * sumOfSecondPartForY);
    }

    const finalOutcome = determineMaximum(candidateOneResult, candidateTwoResult);
    
    globalThis.console.log(finalOutcome);

    return 0;
};

executeCalculation(globalThis.process.binding('fs').read(0, 1024 * 1024, 0).toString('utf8'));