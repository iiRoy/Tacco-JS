(function (rawData) {
    const lineSegments = rawData.replace(/\r/g, '').split("\n");

    const parseNumericValue = (inputString) => parseInt(inputString, 10);

    let numElementsInSequence, windowLength;
    let dataSequenceValues;
    let calculatedWindowSums;
    let overallMaximumSum;

    while (true) {
        const currentInputLineParts = lineSegments.shift().split(' ');

        numElementsInSequence = parseNumericValue(currentInputLineParts[0]);
        windowLength = parseNumericValue(currentInputLineParts[1]);

        if (numElementsInSequence === 0 && windowLength === 0) {
            break;
        }

        dataSequenceValues = [];
        for (let sequenceIndex = 0; sequenceIndex < numElementsInSequence; sequenceIndex++) {
            const currentSequenceValue = parseNumericValue(lineSegments.shift());
            dataSequenceValues.push(currentSequenceValue);
        }

        calculatedWindowSums = [];
        const maxPossibleWindowStart = numElementsInSequence - windowLength;

        for (let windowStartIndex = 0; windowStartIndex <= maxPossibleWindowStart; windowStartIndex++) {
            const currentWindow = dataSequenceValues.slice(windowStartIndex, windowStartIndex + windowLength);
            const sumOfCurrentWindow = currentWindow.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
            calculatedWindowSums.push(sumOfCurrentWindow);
        }

        if (calculatedWindowSums.length === 0) {
            overallMaximumSum = undefined;
        } else {
            overallMaximumSum = calculatedWindowSums[0];
            for (let sumValue of calculatedWindowSums.slice(1)) {
                if (sumValue > overallMaximumSum) {
                    overallMaximumSum = sumValue;
                }
            }
        }

        console.log(overallMaximumSum);
    }
})(require("fs").readFileSync("/dev/stdin", "utf8"));
