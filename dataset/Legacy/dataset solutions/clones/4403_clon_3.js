function processInputData(rawData) {
    const TARGET_PAIRS_TO_FIND = 2;
    let collectedPairs = [0, 0];
    
    const inputLines = rawData.split('\n');
    const secondLineContent = inputLines[1];
    
    let numericValues = secondLineContent.split(' ').map(Number);
    
    numericValues.sort((valA, valB) => valB - valA);

    let currentPairIndex = 0;
    const maxSearchIndex = numericValues.length - 1;

    for (let i = 0; i < maxSearchIndex && currentPairIndex < TARGET_PAIRS_TO_FIND; i++) {
        const currentNumber = numericValues[i];
        const nextNumber = numericValues[i + 1];

        if (currentNumber === nextNumber) {
            collectedPairs[currentPairIndex] = currentNumber;
            i++;
            currentPairIndex++;
        }
    }

    const productOfPairs = collectedPairs[0] * collectedPairs[1];
    console.log(productOfPairs);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
