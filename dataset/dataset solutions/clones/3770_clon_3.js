function ProcessInput(rawData) {
    const initialNumericValue = parseInt(rawData, 10);
    let currentRemainingValue = initialNumericValue;
    let accumulatedCount = 0;

    function calculateAndSubtractLargestPower(valueToProcess, baseNumber, currentTotal) {
        let iteratedPower = baseNumber;
        let largestFoundPower = 0;

        while (iteratedPower <= valueToProcess) {
            largestFoundPower = iteratedPower;
            if (iteratedPower > Number.MAX_SAFE_INTEGER / baseNumber) {
                break;
            }
            iteratedPower *= baseNumber;
        }

        if (largestFoundPower > 0) {
            valueToProcess -= largestFoundPower;
            currentTotal++;
        }
        return { updatedValue: valueToProcess, updatedTotal: currentTotal };
    }

    const baseNine = 9;
    let nineProcessingResult = calculateAndSubtractLargestPower(currentRemainingValue, baseNine, accumulatedCount);
    currentRemainingValue = nineProcessingResult.updatedValue;
    accumulatedCount = nineProcessingResult.updatedTotal;

    const baseSix = 6;
    let sixProcessingResult = calculateAndSubtractLargestPower(currentRemainingValue, baseSix, accumulatedCount);
    currentRemainingValue = sixProcessingResult.updatedValue;
    accumulatedCount = sixProcessingResult.updatedTotal;

    accumulatedCount += currentRemainingValue;

    console.log(accumulatedCount);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
