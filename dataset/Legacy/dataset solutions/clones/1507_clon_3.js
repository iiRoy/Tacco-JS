function processInput(rawData) {
    const lines = rawData.split("\n");
    const numEntries = parseInt(lines[0], 10);

    let resultFlag = "No";
    let consecutiveMatches = 0;

    const REQUIRED_CONSECUTIVE_MATCHES = 3;

    // Helper function to parse a line and check if the two numbers are equal
    const checkPairEquality = (lineContent) => {
        const parts = lineContent.split(" ");
        const firstValue = parseInt(parts[0], 10);
        const secondValue = parseInt(parts[1], 10);
        return firstValue === secondValue;
    };

    for (let idx = 1; idx <= numEntries; idx++) {
        const currentLineData = lines[idx];
        const areValuesEqual = checkPairEquality(currentLineData);

        if (areValuesEqual) {
            consecutiveMatches++;
            if (consecutiveMatches >= REQUIRED_CONSECUTIVE_MATCHES) {
                resultFlag = "Yes";
                break;
            }
        } else {
            consecutiveMatches = 0;
        }
    }

    console.log(resultFlag);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
