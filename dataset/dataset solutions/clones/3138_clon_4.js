function analyzeData(rawData) {
    let currentPosition = 0;
    let newlinePosition = -1;

    // Skip the first line (c) which is unused in the original logic.
    newlinePosition = rawData.indexOf('\n', currentPosition);
    currentPosition = newlinePosition + 1;

    // Extract the coefficients (B) from the second line.
    newlinePosition = rawData.indexOf('\n', currentPosition);
    const coefficientString = rawData.substring(currentPosition, newlinePosition);
    currentPosition = newlinePosition + 1;

    const coefficientValues = [];
    let segmentStart = 0;
    let segmentEnd = coefficientString.indexOf(' ', segmentStart);
    while (segmentEnd !== -1) {
        coefficientValues.push(Number(coefficientString.substring(segmentStart, segmentEnd)));
        segmentStart = segmentEnd + 1;
        segmentEnd = coefficientString.indexOf(' ', segmentStart);
    }
    // Add the last coefficient value.
    coefficientValues.push(Number(coefficientString.substring(segmentStart)));

    let positiveSumCount = 0;

    // Process the remaining lines (data vectors).
    while (currentPosition < rawData.length) {
        newlinePosition = rawData.indexOf('\n', currentPosition);
        let currentLineEnd = (newlinePosition === -1) ? rawData.length : newlinePosition;
        const dataVectorString = rawData.substring(currentPosition, currentLineEnd);

        let lineWeightedSum = 0;
        let valueStart = 0;
        let valueEnd = dataVectorString.indexOf(' ', valueStart);
        let coeffIndex = 0;

        // Loop through values in the data vector string
        while (valueEnd !== -1) {
            const dataPoint = Number(dataVectorString.substring(valueStart, valueEnd));
            lineWeightedSum += dataPoint * coefficientValues[coeffIndex];
            valueStart = valueEnd + 1;
            valueEnd = dataVectorString.indexOf(' ', valueStart);
            coeffIndex++;
        }
        // Add the last data point in the line.
        // This handles cases where there's only one number, or the last number after spaces.
        const dataPoint = Number(dataVectorString.substring(valueStart));
        lineWeightedSum += dataPoint * coefficientValues[coeffIndex];

        if (lineWeightedSum > 0) {
            positiveSumCount++;
        }

        currentPosition = currentLineEnd + 1;
        if (newlinePosition === -1) break;
    }

    console.log(positiveSumCount);
}

analyzeData(require('fs').readFileSync('/dev/stdin', 'utf8'));