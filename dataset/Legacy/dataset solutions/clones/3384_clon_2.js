const primeDecomposition = (inputNum) => {
    let primeFactorsList = []; // Array to store prime factors and their corresponding exponents.

    // Iterate through potential divisors starting from 2 up to the square root of the number.
    for (let divisorCandidate = 2; divisorCandidate * divisorCandidate <= inputNum; divisorCandidate++) {
        let powerCount = 0; // Initialize the count for the current prime factor's exponent.

        // Continuously divide the number by the candidate as long as it's divisible.
        while (inputNum % divisorCandidate === 0) {
            inputNum /= divisorCandidate; // Reduce the number.
            powerCount++; // Increment the exponent count.
        }

        // If the candidate was a factor (i.e., its exponent is greater than zero), add it to our list.
        if (powerCount > 0) {
            primeFactorsList.push({ p: divisorCandidate, e: powerCount });
        }
    }

    // If, after all divisions, the remaining number is not 1, it means it's a prime factor itself.
    if (inputNum !== 1) {
        primeFactorsList.push({ p: inputNum, e: 1 });
    }

    return primeFactorsList; // Return the complete list of prime factors.
};

const processInput = (inputString) => {
    // Parse the input string to extract two numerical values.
    const [divisorVal, targetNum] = inputString.split(" ").map(Number);

    // Obtain the prime factorization of the second number (targetNum).
    const factorData = primeDecomposition(targetNum);

    let resultProduct = 1; // Initialize the variable to store the final product.

    // Loop through each prime factor and its exponent found in the factorization.
    for (let idx = 0; idx < factorData.length; idx++) {
        // Calculate the integer part of the exponent divided by the first input value (divisorVal).
        let tempExponent = parseInt(factorData[idx].e / divisorVal);
        // Multiply the resultProduct by the prime factor raised to the calculated temporary exponent.
        resultProduct *= factorData[idx].p ** tempExponent;
    }

    // Output the final computed product to the console.
    console.log(resultProduct);
};

// Read the input from standard input and pass it to the main processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
