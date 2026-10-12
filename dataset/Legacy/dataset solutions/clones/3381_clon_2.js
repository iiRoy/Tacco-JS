process.stdin.resume();
process.stdin.setEncoding('utf8');

// This function computes the prime factorization of a given positive integer.
// It returns an array of objects, where each object contains a prime factor
// and its corresponding exponent.
const primeDecomposition = (inputNum) => {
    let primeFactors = []; // Stores the prime factors and their exponents.
    // Iterate from 2 up to the square root of the number.
    for (let divisor = 2; divisor * divisor <= inputNum; divisor++) {
        let powerCount = 0; // Initialize exponent for the current divisor.
        // While the current number is divisible by 'divisor', keep dividing
        // and incrementing the exponent.
        while (inputNum % divisor === 0) {
            inputNum /= divisor;
            powerCount++;
        }
        // If 'divisor' was a factor (i.e., its exponent is greater than 0),
        // add it to our list of prime factors.
        if (powerCount > 0) {
            primeFactors.push({ factor: divisor, count: powerCount });
        }
    }

    // If after the loop, 'inputNum' is not 1, it means the remaining 'inputNum'
    // itself is a prime factor (greater than its square root).
    if (inputNum !== 1) {
        primeFactors.push({ factor: inputNum, count: 1 });
    }
    return primeFactors; // Return the complete list of prime factors.
};

// The main execution function that processes the input and calculates the result.
const executeCalculation = (inputString) => {
    // Parse the input string into two numbers: N and P.
    const [numDivisors, targetProduct] = inputString.split(" ").map(Number);

    // Get the prime factorization of P.
    const factorList = primeDecomposition(targetProduct);

    let resultValue = 1; // Initialize the result, which will be the final GCD.

    // Iterate through each prime factor found in P.
    for (let idx = 0; idx < factorList.length; idx++) {
        // Calculate how many times the current prime factor (factorList[idx].factor)
        // can be included in the result, given N.
        // This is equivalent to floor(exponent / N).
        let tempExponent = Math.floor(factorList[idx].count / numDivisors);
        // Multiply the result by the prime factor raised to the calculated exponent.
        resultValue *= factorList[idx].factor ** tempExponent;
    }

    // Output the final calculated value to the console.
    console.log(resultValue);
};

// Read input from standard input and pass it to the main calculation function.
executeCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));
