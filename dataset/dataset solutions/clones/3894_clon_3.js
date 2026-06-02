function ProcessInput(rawData) {
    const processedLines = rawData.split("\n");

    const configParts = processedLines[0].split(" ");

    const gridCells = parseInt(configParts[0], 10);
    const numberOfFees = parseInt(configParts[1], 10);
    const initialLimit = parseInt(configParts[2], 10);
    
    const feeValueStrings = processedLines[1].split(" ");

    let feesExceedingLimit = 0;
    let feesNotExceedingLimit = 0;

    for (const currentFeeString of feeValueStrings) {
        const currentFeeNumeric = parseInt(currentFeeString, 10);
        if (currentFeeNumeric > initialLimit) {
            feesExceedingLimit++;
        } else {
            feesNotExceedingLimit++;
        }
    }

    const minimumCount = Math.min(feesExceedingLimit, feesNotExceedingLimit);
    console.log(minimumCount);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
