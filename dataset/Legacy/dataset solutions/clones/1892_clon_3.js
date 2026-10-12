function determineOutputString(receivedData) {
    const targetStringForMatch = "ABC";
    const matchedOutput = "ARC";
    const unmatchedOutput = "ABC";

    if (receivedData === targetStringForMatch) {
        return matchedOutput;
    } else {
        return unmatchedOutput;
    }
}

function processInput(dataString) {
    const computedResult = determineOutputString(dataString);
    console.log(computedResult);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
