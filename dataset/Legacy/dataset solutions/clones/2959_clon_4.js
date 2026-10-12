function processInput(rawData) {
    const parsedValues = rawData.trim().split(" ");
    const upperBound = parseInt(parsedValues[0], 10);
    const targetValue = parseInt(parsedValues[1], 10);

    let cumulativeProbability = 0;

    for (let currentNumber = 1; currentNumber <= upperBound; currentNumber++) {
        let requiredDoublings;
        if (currentNumber >= targetValue) {
            requiredDoublings = 0;
        } else {
            // Calculate the minimum non-negative integer 'd' such that currentNumber * 2^d >= targetValue
            // This is equivalent to 2^d >= targetValue / currentNumber
            // Taking log base 2: d >= log2(targetValue / currentNumber)
            // Since 'd' must be an integer, d = ceil(log2(targetValue / currentNumber))
            requiredDoublings = Math.ceil(Math.log2(targetValue / currentNumber));
        }
        
        // The probability of selecting 'currentNumber' is 1/upperBound.
        // The probability of reaching 'targetValue' from 'currentNumber' in 'requiredDoublings' steps is (1/2)^requiredDoublings.
        cumulativeProbability += (1 / upperBound) * Math.pow(0.5, requiredDoublings);
    }

    console.log(cumulativeProbability);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
