function solveProblem(inputDataString) {
    const inputLines = inputDataString.split("\n");

    const totalCountString = inputLines[0];
    const totalCount = parseInt(totalCountString, 10);

    const sequenceString = inputLines[1];

    const redSplitParts = sequenceString.split('R');
    const redCount = redSplitParts.length - 1;

    const halfCountThreshold = totalCount / 2;

    const isRedMajority = redCount > halfCountThreshold;

    if (isRedMajority) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}

solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
