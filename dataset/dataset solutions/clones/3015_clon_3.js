function processInput(rawData) {
    const lines = rawData.split("\n");
    const firstLineParts = lines[0].split(" ");
    const elementCount = Number.parseInt(firstLineParts[0]);
    const numberStrings = lines[1].split(" ");

    const numbers = numberStrings.map(str => Number.parseInt(str));

    let idx = 0;
    let minAbsVal = 0;
    let minAbsIdx = 0;
    let totalAbsoluteSum = 0;
    let negativeCount = 0;
    let hasZeroFlag = false;

    // Count negative numbers and check for the presence of zero
    for (idx = 0; idx < elementCount; idx++) {
        const currentNum = numbers[idx];
        if (currentNum < 0) {
            negativeCount++;
        }
        if (currentNum === 0) {
            hasZeroFlag = true;
        }
    }

    // Determine if an adjustment is required for the sum calculation
    // An adjustment is needed if there are no zeros AND an odd number of negatives
    const requiresAdjustment = !hasZeroFlag && (negativeCount % 2 !== 0);

    // If adjustment is required, find the number with the smallest absolute value
    if (requiresAdjustment) {
        minAbsVal = Math.abs(numbers[0]);
        minAbsIdx = 0;
        for (idx = 1; idx < elementCount; idx++) {
            const currentAbsolute = Math.abs(numbers[idx]);
            if (minAbsVal > currentAbsolute) {
                minAbsVal = currentAbsolute;
                minAbsIdx = idx;
            }
        }
    }

    // Calculate the total absolute sum, applying adjustment if necessary
    for (idx = 0; idx < elementCount; idx++) {
        const currentNumber = numbers[idx];
        const currentAbsolute = Math.abs(currentNumber);

        if (!requiresAdjustment) {
            // If no adjustment is needed (either has zero or even negatives),
            // simply add the absolute value
            totalAbsoluteSum += currentAbsolute;
        } else {
            // If adjustment is needed (no zero AND odd negatives),
            // subtract the smallest absolute value once, add others
            if (idx === minAbsIdx) {
                totalAbsoluteSum -= currentAbsolute;
            } else {
                totalAbsoluteSum += currentAbsolute;
            }
        }
    }
    console.log(totalAbsoluteSum);
}
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
