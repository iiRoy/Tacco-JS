// This function serves as the primary entry point for processing the given data.
function ProcessInput(rawData) {
    // Divide the raw input string into its constituent parts based on space.
    var inputParts = rawData.split(" ");
    var firstInteger = inputParts[0]; // Corresponds to N in the original problem.
    var secondInteger = inputParts[1]; // Corresponds to M in the original problem.

    // Coerce string values to numbers using the bitwise NOT operator for efficiency.
    firstInteger = ~~firstInteger;
    secondInteger = ~~secondInteger;

    // Initialize a dynamic array to store prime numbers, starting with the first two.
    var primeNumbers = [2, 3];

    // The second integer will be the number we factorize.
    var currentNumberForFactorization = secondInteger;

    // Determine the upper bound for prime generation by calculating the square root.
    var factorizationLimit = Math.floor(Math.sqrt(currentNumberForFactorization));

    // Iterate to find prime numbers up to the calculated limit.
    // We start checking from the number immediately following the last known prime.
    for (var counter = primeNumbers[primeNumbers.length - 1] + 1; counter <= factorizationLimit; counter++) {
        // Check if the current 'counter' is divisible by any existing prime.
        // If no divisor is found, it means 'counter' is a prime number.
        if (primeNumbers.find(potentialDivisor => counter % potentialDivisor === 0) === undefined) {
            primeNumbers.push(counter); // Add the newly found prime to our list.
        }
    }

    // An object to accumulate the frequency of each prime factor.
    var primeFactorCounts = {};

    // Perform prime factorization on 'currentNumberForFactorization'.
    for (var currentPrimeCandidate of primeNumbers) {
        // Continuously divide 'currentNumberForFactorization' by 'currentPrimeCandidate'
        // as long as it's divisible, incrementing the count for that prime.
        while (currentNumberForFactorization % currentPrimeCandidate === 0) {
            currentNumberForFactorization /= currentPrimeCandidate;
            // Use the logical OR operator to initialize count to 0 if the prime is encountered first time.
            primeFactorCounts[currentPrimeCandidate] = (primeFactorCounts[currentPrimeCandidate] || 0) + 1;
        }
    }

    // After iterating through the generated primes, if 'currentNumberForFactorization'
    // is still greater than 1, it implies the remaining value is also a prime factor.
    if (currentNumberForFactorization !== 1) {
        primeFactorCounts[currentNumberForFactorization] = (primeFactorCounts[currentNumberForFactorization] || 0) + 1;
    }

    // Initialize the cumulative product and the modulus value.
    var finalProduct = 1;
    var modulusValue = 1000000007; // A common large prime modulus (10^9 + 7).

    // Define a nested function to compute combinations (n choose k).
    var calculateCombinations = function(totalElements, selectedElements) {
        // Optimize by choosing the smaller value between k and n-k for calculations.
        selectedElements = Math.min(selectedElements, totalElements - selectedElements);
        var tempProduct = 1;
        // Calculate the numerator part of the combination formula.
        for (var iter = 0; iter < selectedElements; iter++) {
            tempProduct *= (totalElements - iter);
        }
        // Calculate the denominator part (k!) by dividing the temporary product.
        for (var iter = 0; iter < selectedElements; iter++) {
            tempProduct /= (iter + 1);
        }
        return tempProduct;
    };

    // Iterate through each unique prime factor and its count.
    for (var factorIdentifier in primeFactorCounts) {
        var factorExponent = primeFactorCounts[factorIdentifier]; // The power to which the prime is raised.
        // Compute the number of combinations using the "stars and bars" formula: C(n+k-1, k).
        // Here, n = firstInteger, k = factorExponent.
        var currentCombinationResult = calculateCombinations(factorExponent + firstInteger - 1, factorExponent);
        // Multiply the running product and apply the modulo operation to prevent overflow.
        finalProduct *= currentCombinationResult;
        finalProduct %= modulusValue;
    }

    // Return the final computed result.
    return finalProduct;
}

// This self-executing anonymous function handles the execution environment.
((argA, argB, argC) => {
    // Check if the 'require' function is available, indicating a Node.js environment.
    if (typeof require !== "undefined") {
        // In Node.js, read input from standard input and print the result to console.
        console.log(ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8")));
    } else {
        // In a browser or similar environment, process the embedded input string.
        argA = argA.split("\n").slice(1, -1).join("\n"); // Extract the actual input from the multiline string literal.
        argB = (function() {
            try {
                return ProcessInput(argA); // Attempt to execute the main logic.
            } catch (errObject) {
                return errObject.stack || errObject.message; // Capture and return error details if an exception occurs.
            }
        })(); // Immediately invoke this inner function.
        argC = typeof argB; // Determine the data type of the result.
        // If the result is not a string, convert it to a JSON string for display.
        if (argC !== "string") {
            argB = JSON.stringify(argB);
        }
        // Assuming jQuery or a similar library is available for DOM manipulation.
        // Create and append HTML elements to display the input and output.
        $("<form>").append(
            [
                [10, argA], // Text area for input.
                0, // Line break.
                [1, argC], // Text area for output type.
                0, // Line break.
                [10, argB] // Text area for output value.
            ].map(itemData => {
                // Map array items to either a textarea or a line break element.
                if (itemData) {
                    return $("<textarea>", {
                        rows: itemData[0],
                        cols: 40,
                        text: itemData[1]
                    });
                } else {
                    return $("<br>");
                }
            })
        ).appendTo("body"); // Add the generated form to the document body.
    }
})(`
3 12
`); // The hardcoded input string for browser-based testing.
