function processInputData(inputManifest) {
    // Stage 1: Input decomposition
    const [primaryLine] = inputManifest.split('\n');
    const [thresholdString, subjectValueString] = primaryLine.split(' ');

    const groupThreshold = parseInt(thresholdString, 10);
    const subjectValue = parseInt(subjectValueString, 10);

    // Stage 2: Factor identification and quantification
    const factorTally = new Map();
    let currentDivisorCandidate = 2;
    let mutableSubject = subjectValue;

    while (currentDivisorCandidate * currentDivisorCandidate <= mutableSubject) {
        if (mutableSubject % currentDivisorCandidate === 0) {
            factorTally.set(currentDivisorCandidate, (factorTally.get(currentDivisorCandidate) || 0) + 1);
            mutableSubject /= currentDivisorCandidate;
        } else {
            currentDivisorCandidate++;
        }
    }

    if (mutableSubject > 1) {
        factorTally.set(mutableSubject, (factorTally.get(mutableSubject) || 0) + 1);
    }

    // Stage 3: Result aggregation
    const finalAggregation = Array.from(factorTally.entries()).reduce((aggregateProduct, [baseFactor, countExponent]) => {
        const effectiveExponent = Math.floor(countExponent / groupThreshold);
        return aggregateProduct * Math.pow(baseFactor, effectiveExponent);
    }, 1);

    console.log(finalAggregation.toString());
}