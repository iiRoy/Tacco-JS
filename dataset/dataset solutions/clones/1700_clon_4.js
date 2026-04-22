const dataProcessor = (sourceContent) => {
    const contentLines = sourceContent.split('\n');
    const firstValueLine = contentLines[0];
    const secondValueLine = contentLines[1];

    const elementQuantity = Number(firstValueLine);
    const rawNumberSegments = secondValueLine.split(' ');

    const numericalCollection = rawNumberSegments.slice(0, elementQuantity).map(Number);

    const sortedDescendingCollection = numericalCollection.sort((valA, valB) => valB - valA);

    const recursiveAggregator = (dataset, upperLimit, currentPosition, runningTotal) => {
        if (currentPosition >= upperLimit) {
            return runningTotal;
        }
        const valueToAdd = dataset[Math.floor((currentPosition - 1) / 2)];
        return recursiveAggregator(dataset, upperLimit, currentPosition + 1, runningTotal + valueToAdd);
    };

    let finalComputationResult = 0;
    if (elementQuantity > 0) {
        finalComputationResult = sortedDescendingCollection[0];
        if (elementQuantity >= 3) {
            finalComputationResult = recursiveAggregator(sortedDescendingCollection, elementQuantity, 2, finalComputationResult);
        }
    }

    console.log(finalComputationResult);
};

dataProcessor(require("node:fs").readFileSync("/dev/stdin", "utf8"));