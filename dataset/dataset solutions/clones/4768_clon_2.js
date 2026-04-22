let acquireText = () => require("fs").readFileSync("/dev/stdin", "utf8").trim();

const displayResult = (outputData) => {
    console.log(outputData);
}; // Output the processed data to standard output

/*
 * Data conversion utility function.
 * Options for transformation:
 *   0: Return input as-is (no modification).
 *   1: Convert to an integer value.
 *   2: Split by single space into a string array.
 *   3: Split by newline character into a string array.
 *   4: Split by space, then map all elements to numbers.
 *   5: Split by newline, then map all elements to numbers.
 *   6: Split into an array of individual characters.
 *   7: Split into characters, then map all to numbers.
 */
function transformData(sourceValue, transformationType) {
    switch (transformationType) {
        case 0:
            return sourceValue;
        case 1:
            return parseInt(sourceValue, 10);
        case 2:
            return sourceValue.split(" ");
        case 3:
            return sourceValue.split("\n");
        case 4:
            return sourceValue.split(" ").map(entry => Number(entry));
        case 5:
            return sourceValue.split("\n").map(entry => Number(entry));
        case 6:
            return sourceValue.split("");
        case 7:
            return sourceValue.split("").map(entry => Number(entry));
    }
}

function ProcessNumberFactors(initialValue) {
    initialValue = transformData(initialValue, 1);

    // The count of divisors for a number N is (e1+1)*(e2+1)*...*(ek+1),
    // where e_i are the exponents of its prime factors in the prime factorization.
    // This array will store the frequency (exponents) of each prime factor.
    let primeExponents = new Array(initialValue + 1).fill(0);
    const remainderValue = 1000000007;

    for (let currentNumber = 1; currentNumber <= initialValue; currentNumber++) {
        if (currentNumber === 1) {
            primeExponents[1] = 1;
            continue;
        } else {
            let workingNumber = currentNumber;
            for (let candidateFactor = 2; candidateFactor <= workingNumber;) {
                if (workingNumber % candidateFactor === 0) {
                    primeExponents[candidateFactor]++;
                    workingNumber /= candidateFactor;
                } else {
                    candidateFactor++;
                }
            }
        }
    }

    let productAccumulator = 1;
    for (let index = 2; index < primeExponents.length; index++) {
        if (primeExponents[index] !== 0) {
            productAccumulator = (productAccumulator * (primeExponents[index] + 1)) % remainderValue;
        }
    }
    // displayResult(primeExponents); // For debugging purposes, shows prime factor counts
    displayResult(productAccumulator);
}

ProcessNumberFactors(acquireText());