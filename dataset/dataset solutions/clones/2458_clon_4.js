const calculateWeightedPathSum = (inputData) => {
    const linesOfText = inputData.split('\n');
    const directionalSymbols = Array.from(linesOfText[0]);
    const totalSegments = directionalSymbols.length + 1;

    // Initialize an array of objects, where each object represents a segment point
    // and stores its calculated 'weight'. Using objects makes the data structure
    // diverge from the original's simple number arrays.
    let segmentScores = Array.from({ length: totalSegments }, () => ({ weight: 0 }));

    // First propagation pass: left-to-right.
    // This pass ensures that 'weight' increases for '<' symbols.
    // Using forEach for iteration instead of a traditional 'for' loop.
    directionalSymbols.forEach((currentSymbol, symbolPosition) => {
        if (currentSymbol === '<') {
            const previousWeight = segmentScores[symbolPosition].weight;
            const currentPointWeight = segmentScores[symbolPosition + 1].weight;
            segmentScores[symbolPosition + 1].weight = Math.max(currentPointWeight, previousWeight + 1);
        }
    });

    // Second propagation pass: right-to-left.
    // This pass ensures that 'weight' increases for '>' symbols.
    // Creating a reversed sequence of indices and then using forEach
    // provides a different syntactic structure for reverse iteration.
    Array.from({ length: directionalSymbols.length }, (_, reverseIndex) => directionalSymbols.length - 1 - reverseIndex)
        .forEach(symbolPosition => {
            const currentSymbol = directionalSymbols[symbolPosition];
            if (currentSymbol === '>') {
                const nextWeight = segmentScores[symbolPosition + 1].weight;
                const currentPointWeight = segmentScores[symbolPosition].weight;
                segmentScores[symbolPosition].weight = Math.max(currentPointWeight, nextWeight + 1);
            }
        });

    // Sum up all the final weights from the segmentScores array.
    const overallTotal = segmentScores.reduce((accumulator, scoreObject) => accumulator + scoreObject.weight, 0);

    console.log('%s', overallTotal);
    return overallTotal;
};

calculateWeightedPathSum(require("fs").readFileSync("/dev/stdin", "utf8"));