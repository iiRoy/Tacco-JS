const primeDecomposition = (inputNum) => { // Function to find the prime factors of a number
    let factorElements = []; // Array to store objects of prime factors and their exponents
    for (let trialDivisor = 2; trialDivisor * trialDivisor <= inputNum; trialDivisor++) {
        let currentPower = 0; // Initialize exponent for the current trial divisor
        while (inputNum % trialDivisor === 0) {
            inputNum /= trialDivisor; // Divide the number by the current prime factor
            currentPower++; // Increment the exponent count
        }
        if (currentPower > 0) { // If the trial divisor was a factor
            factorElements.push({
                primeBase: trialDivisor,
                powerVal: currentPower
            }); // Add the prime and its exponent to the list
        }
    }

    if (inputNum !== 1) { // If there's a remaining number greater than 1, it's a prime itself
        factorElements.push({
            primeBase: inputNum,
            powerVal: 1
        }); // Add the remaining prime with an exponent of 1
    }
    return factorElements; // Return the complete list of prime factor objects
};

const processCalculation = (inputStringData) => { // Main function to handle input and compute the result
    // Split the input string by space and convert parts to numbers
    const [firstValue, secondValue] = inputStringData.split(" ").map(Number);

    // Get the prime factorization of the second numeric value
    const primeFactorList = primeDecomposition(secondValue);

    let computedProduct = 1; // Initialize a variable to store the final product
    // Iterate through each prime factor in the obtained list
    for (let idx = 0; idx < primeFactorList.length; idx++) {
        // Calculate the effective exponent for the current prime factor
        let tempExponent = Math.floor(primeFactorList[idx].powerVal / firstValue);
        // Multiply the computed product by the prime base raised to the effective exponent
        computedProduct *= (primeFactorList[idx].primeBase ** tempExponent);
    }
    // Print the final calculated product to the console
    console.log(computedProduct);
};

// Invoke the main processing function by reading input from standard input
processCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));