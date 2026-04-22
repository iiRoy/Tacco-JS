function ExecuteProcess(dataSource) {
    const dataLines = dataSource.split('\n');
    const initialQuantity = Number(dataLines[0]);
    const numericCollection = dataLines[1].split(' ').map(Number);

    const determineCentralValue = (firstTerm, secondTerm, thirdTerm) => {
        const sumOfTerms = firstTerm + secondTerm + thirdTerm;
        const lowestTerm = Math.min(firstTerm, secondTerm, thirdTerm);
        const highestTerm = Math.max(firstTerm, secondTerm, thirdTerm);
        return sumOfTerms - lowestTerm - highestTerm;
    };

    const recursivelyReduce = (currentSequence) => {
        if (currentSequence.length === 1) {
            return currentSequence[0];
        }

        const nextSequenceLayer = Array.from({ length: currentSequence.length - 2 }, (_, position) => {
            const elementA = currentSequence[position];
            const elementB = currentSequence[position + 1];
            const elementC = currentSequence[position + 2];
            return determineCentralValue(elementA, elementB, elementC);
        });

        return recursivelyReduce(nextSequenceLayer);
    };

    const ultimateOutcome = recursivelyReduce(numericCollection);

    console.log(ultimateOutcome);
}

ExecuteProcess(require("fs").readFileSync("/dev/stdin", "utf8"));