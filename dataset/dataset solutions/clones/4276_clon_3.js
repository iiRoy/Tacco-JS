(function setupInputHandling() {
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
})();

function extractNumericParameters(inputLinesArray) {
    const firstLineSegments = inputLinesArray[0].split(" ");
    const secondLineSegments = inputLinesArray[1].split(" ");

    const nValue = parseInt(firstLineSegments[0], 10);
    const kValue = parseInt(secondLineSegments[0], 10);

    return { iterations: nValue, increment: kValue };
}

function performCalculation(sourceDataString) {
    const allInputLines = sourceDataString.split("\n");
    const { iterations: numIterations, increment: stepValue } = extractNumericParameters(allInputLines);

    let currentAccumulatedResult = 1;
    let loopCounter = 1;

    while (loopCounter <= numIterations) {
        let nextAccumulatedValue;
        if (currentAccumulatedResult < stepValue) {
            nextAccumulatedValue = currentAccumulatedResult * 2;
        } else {
            nextAccumulatedValue = currentAccumulatedResult + stepValue;
        }
        currentAccumulatedResult = nextAccumulatedValue;
        loopCounter++;
    }

    console.log(currentAccumulatedResult);
}

const INPUT_FILE_PATH = "/dev/stdin";

performCalculation(require("fs").readFileSync(INPUT_FILE_PATH, "utf8"));
