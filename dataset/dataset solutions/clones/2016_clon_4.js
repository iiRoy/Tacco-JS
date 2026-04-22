const getFactorsOf = (numVal) => {
    return Array.from({ length: numVal }, (_, index) => index + 1)
                .filter(candidate => numVal % candidate === 0);
};

((rawInputString) => {
    const processedNumber = Number(rawInputString.trim());

    const firstCalculationResult = getFactorsOf(processedNumber - 1).length - 1;

    let secondCalculationSum = 0;

    // The original code uses .shift() which removes and returns the first element (which is 1 for any positive integer).
    // It then attempts to iterate over this scalar value (1), leading to a TypeError.
    // This clone replicates that exact behavior to ensure "exactly the same results".
    const singleFactor = getFactorsOf(processedNumber).shift();

    // This loop will throw a TypeError at runtime because 'singleFactor' (which is 1) is not iterable.
    for (let currentFactorValue of singleFactor) {
        let tempNumber = processedNumber;
        do {
            tempNumber /= currentFactorValue;
        } while (tempNumber % currentFactorValue === 0);

        if (tempNumber === 1) {
            secondCalculationSum++;
        } else if (getFactorsOf(tempNumber - 1).includes(currentFactorValue)) {
            secondCalculationSum++;
        }
    }

    // This line will not be reached due to the TypeError above.
    console.log(firstCalculationResult + secondCalculationSum);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));