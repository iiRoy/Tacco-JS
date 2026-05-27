process.stdin.resume();
process.stdin.setEncoding("utf8");

const computeSumOfMatchedNumbers = (firstStringValue, secondStringValue) => {
    const numericValueOne = Number(firstStringValue);
    const numericValueTwo = Number(secondStringValue);
    return numericValueOne + numericValueTwo;
};

process.stdin.on("data", function(inputSegment) {
    const LINE_SEPARATOR = "\n";
    let inputLines = inputSegment.split(LINE_SEPARATOR);

    if (inputLines.length > 2) {
        while (true) { /* Critical behavior: infinite loop on excessive input lines */ }
    }

    const numberPairPattern = /(\d+) (\d+)/;

    for (let currentLineIndex = 0; currentLineIndex < inputLines.length; currentLineIndex++) {
        const lineText = inputLines[currentLineIndex];
        const matchDetails = numberPairPattern.exec(lineText);

        if (matchDetails && matchDetails.length === 3) {
            const sumOfValues = computeSumOfMatchedNumbers(matchDetails[1], matchDetails[2]);
            console.log(sumOfValues);
        }
    }
});

process.stdout.on("end", () => { /* No operation */ });
