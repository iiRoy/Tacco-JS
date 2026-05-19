function processInput(rawData) {
    let currentValue = parseInt(rawData);
    let powerOfTwo = 1;
    let cumulativeSum = 1;

    // The original loop structure updates 'count' and 'out' only if 'H' (after being halved) is still 1 or greater.
    // This implies that the updates occur when the 'currentValue' *before* halving is 2 or greater.
    // For example, if currentValue is 1.9, parseInt makes it 1. The loop condition (1 >= 2) is false, so no updates, sum remains 1.
    // If currentValue is 2, parseInt makes it 2. The loop condition (2 >= 2) is true, updates occur.
    while (currentValue >= 2) {
        // Introduce an intermediate variable for the halving operation.
        const nextIterationValue = currentValue / 2;
        currentValue = nextIterationValue;

        // Update the powerOfTwo variable using a bitwise left shift, equivalent to multiplying by 2.
        powerOfTwo <<= 1;

        // Accumulate the sum by adding the current powerOfTwo.
        cumulativeSum += powerOfTwo;
    }

    console.log(cumulativeSum);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
