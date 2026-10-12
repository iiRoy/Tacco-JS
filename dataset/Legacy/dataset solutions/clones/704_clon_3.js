const outputFn = console.log;

function processInputData(inputLineString) {
    const rawLines = inputLineString.split("\n");
    const filteredLines = rawLines.filter(elementStr => elementStr !== "");
    processNumericSegments(filteredLines);
}

function calculateTrimmedAverage(segmentArray) {
    const workingSegment = [...segmentArray];

    const minimumValue = Math.min(...workingSegment);
    const minIndex = workingSegment.indexOf(minimumValue);
    workingSegment.splice(minIndex, 1);

    const maximumValue = Math.max(...workingSegment);
    const maxIndex = workingSegment.indexOf(maximumValue);
    workingSegment.splice(maxIndex, 1);

    let currentSum = 0;
    for (const val of workingSegment) {
        currentSum += val;
    }

    const remainingLength = workingSegment.length;
    const calculatedAverage = remainingLength > 0 ? currentSum / remainingLength : NaN;
    return Math.floor(calculatedAverage);
}

function processNumericSegments(processedLines) {
    const numericDataSegments = [];
    for (const numericStr of processedLines) {
        numericDataSegments.push(Number(numericStr));
    }

    while (numericDataSegments.length >= 2) {
        const segmentLength = numericDataSegments.shift();
        const currentSegment = numericDataSegments.slice(0, segmentLength);
        numericDataSegments.splice(0, segmentLength);

        const trimmedAverageResult = calculateTrimmedAverage(currentSegment);
        outputFn(trimmedAverageResult);
    }
}

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', processInputData);
