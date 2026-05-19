function ProcessInput(inputString) {
    const parseNumericLine = (lineContent) => {
        return lineContent.split(" ").map(value => parseInt(value, 10));
    };

    let inputLines = inputString.split("\n");

    const firstLineParsed = parseNumericLine(inputLines[0]);
    const elementCount = firstLineParsed[0];

    const dataArray = parseNumericLine(inputLines[1]);

    let currentMinimum = dataArray[0];
    let maximumDifferenceFound = 0;
    let resultCounter = 0;

    for (let index = 1; index < elementCount; ++index) {
        const currentValue = dataArray[index];
        const calculatedDifference = currentValue - currentMinimum;

        if (calculatedDifference > maximumDifferenceFound) {
            maximumDifferenceFound = calculatedDifference;
            resultCounter = 1;
        } else if (calculatedDifference === maximumDifferenceFound) {
            resultCounter++;
        } else {
            // This 'else' block is reached when calculatedDifference < maximumDifferenceFound.
            // The original code's 'else if (min > a[i])' is equivalent to
            // 'if (currentValue < currentMinimum)' under this condition.
            // This preserves the specific behavior where currentMinimum is only updated
            // if the current difference is not the maximum or equal to it.
            if (currentValue < currentMinimum) {
                currentMinimum = currentValue;
            }
        }
    }

    console.log(resultCounter);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
