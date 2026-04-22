function processData(inputContent) {
    const numericValues = inputContent.split(/\s+/).filter(Boolean).map(parseFloat);

    const itemCount = numericValues[0];
    const thresholdValue = numericValues[1];
    const sourceItems = numericValues.slice(2, 2 + itemCount);

    const cumulativeBaseProduct = sourceItems.reduce((acc, current) => acc * current, 1);
    const scalingFactor = Math.pow(0.5, itemCount);
    const finalCalculatedValue = cumulativeBaseProduct * scalingFactor;

    let incrementCount = 0;

    // The original code's while loop: while(max > hanKobai) { hanKobai += hanKobai; count++; }
    // This counts how many times hanKobai needs to be doubled until it is >= max.
    // This is equivalent to ceil(log2(max / hanKobai)) if max > hanKobai, otherwise 0.
    // Edge case: if finalCalculatedValue is 0.
    // If finalCalculatedValue is 0 and thresholdValue > 0, the original loops infinitely.
    // If finalCalculatedValue is 0 and thresholdValue <= 0, the original returns 0.
    // Assuming inputs are such that finalCalculatedValue will be positive for a finite integer output.
    if (thresholdValue <= finalCalculatedValue) {
        incrementCount = 0;
    } else {
        incrementCount = Math.ceil(Math.log2(thresholdValue / finalCalculatedValue));
    }

    console.log(incrementCount);
}

processData(require("node:fs").readFileSync("/dev/stdin", "utf8"));