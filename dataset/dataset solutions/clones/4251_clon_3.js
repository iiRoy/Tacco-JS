function processInputData(rawData) {
    const trimmedInput = rawData.trim();
    const inputLines = trimmedInput.split('\n');

    const firstLine = inputLines[0];
    const secondLine = inputLines[1];

    function checkSpecificPattern(lineA, lineB) {
        const firstComparison = lineA[0] === lineB[2];
        const secondComparison = lineB[0] === lineA[2];
        const thirdComparison = lineA[1] === lineB[1];

        return firstComparison && secondComparison && thirdComparison;
    }

    const patternMatches = checkSpecificPattern(firstLine, secondLine);

    console.log(patternMatches ? 'YES' : 'NO');
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
