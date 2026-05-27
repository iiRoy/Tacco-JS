function reduceSequenceOnce(currentNumbers) {
    const nextNumbers = [];
    const sequenceLength = currentNumbers.length;

    for (let elementIndex = 0; elementIndex < sequenceLength - 1; elementIndex++) {
        nextNumbers.push(Math.abs(currentNumbers[elementIndex] - currentNumbers[elementIndex + 1]));
    }
    nextNumbers.push(Math.abs(currentNumbers[sequenceLength - 1] - currentNumbers[0]));

    nextNumbers.pop();

    return nextNumbers;
}

function processInputData(rawDataContent) {
    const inputLines = rawDataContent.split("\n");
    let lineCursor = 0;

    while (lineCursor < inputLines.length) {
        const initialCount = parseInt(inputLines[lineCursor]);
        const charSequence = inputLines[lineCursor + 1].split("");
        let numericSequence = charSequence.map(Number);

        while (numericSequence.length > 1) {
            numericSequence = reduceSequenceOnce(numericSequence);
        }

        console.log(numericSequence[0]);
        lineCursor += 2;
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
