(function() {
    const dataStream = require("fs").readFileSync("/dev/stdin", "utf8");

    const inputLines = dataStream.trim().split("\n");
    const totalCount = Number(inputLines[0]);
    const initialNumericSet = inputLines[1].split(" ").map(Number);

    const sortedNumericSet = [...initialNumericSet].sort((valOne, valTwo) => valOne - valTwo);

    const lowerMedianIdx = totalCount / 2 - 1;
    const upperMedianIdx = totalCount / 2;

    const firstPivot = sortedNumericSet[lowerMedianIdx];
    const secondPivot = sortedNumericSet[upperMedianIdx];

    const processedResults = initialNumericSet.map(currentElement => {
        // Divergent expression for the conditional logic
        return [secondPivot, firstPivot][+(currentElement > firstPivot)];
    });

    console.log(processedResults.join("\n"));
})();
