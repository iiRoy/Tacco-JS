function ProcessInput(rawInput) {
    const lines = rawInput.split("\n");
    const [numStr, strA, strB, strC] = lines;
    const iterationLimit = parseInt(numStr, 10);

    const charSequenceA = strA.split("");
    const charSequenceB = strB.split("");
    const charSequenceC = strC.split("");

    const comparisonResults = Array.from({ length: iterationLimit }, (_, currentPosition) => currentPosition).reduce((tallyObject, idx) => {
        tallyObject.diffOneTwo += +(charSequenceA[idx] !== charSequenceB[idx]);
        tallyObject.diffOneThree += +(charSequenceA[idx] !== charSequenceC[idx]);
        tallyObject.diffTwoThree += +(charSequenceB[idx] !== charSequenceC[idx]);
        return tallyObject;
    }, { diffOneTwo: 0, diffOneThree: 0, diffTwoThree: 0 });

    const { diffOneTwo, diffOneThree, diffTwoThree } = comparisonResults;

    const aggregateOne = diffOneTwo + diffOneThree;
    const aggregateTwo = diffOneTwo + diffTwoThree;
    const aggregateThree = diffOneThree + diffTwoThree;

    console.log('%d', Math.min(aggregateOne, aggregateTwo, aggregateThree));
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
