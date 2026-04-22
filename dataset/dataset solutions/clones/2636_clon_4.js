function executeSequence(dataSource) {
    const parsedLines = dataSource.split("\n");

    const initialElements = parsedLines[1].split(" ").map(Number).sort((first, second) => first - second);

    const combineAndReduce = (workingSet) => {
        if (workingSet.length === 1) {
            return workingSet[0];
        }

        const smallestA = workingSet[0];
        const smallestB = workingSet[1];

        const intermediateAverage = (smallestA + smallestB) / 2;

        const updatedSet = workingSet.slice(2).concat([intermediateAverage]);

        const reorderedSet = updatedSet.sort((first, second) => first - second);

        return combineAndReduce(reorderedSet);
    };

    const finalOutcome = combineAndReduce(initialElements);

    console.log(finalOutcome);
}

executeSequence(require("fs").readFileSync("/dev/stdin", "utf8").trim());