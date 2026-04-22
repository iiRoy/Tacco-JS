function CalculateResult(rawData) {
    // Break down the received string into two distinct numeric components
    let firstPart = rawData.split(" ")[0];
    let secondPart = rawData.split(" ")[1];

    // Convert these string fragments into whole numbers, ensuring any decimal parts are discarded.
    let countParam = parseInt(firstPart, 10);
    let targetNum = Math.trunc(parseFloat(secondPart));

    // Establish an initial collection of known prime numbers for factorization.
    const knownPrimes = [2, 3];

    // The second numeric component will be the subject of our prime factorization process.
    let numberToFactor = targetNum;

    // Determine the upper bound for our prime number search, based on the square root of the target.
    let sqrtLimit = Math.floor(Math.sqrt(numberToFactor));

    // Systematically find and add more prime numbers to our collection, up to the calculated square root limit.
    for (let currentCandidate = knownPrimes[knownPrimes.length - 1] + 1; currentCandidate <= sqrtLimit; currentCandidate++) {
        // Verify if the current number under consideration is divisible by any already identified primes.
        // If it's not divisible by any, it's a new prime.
        if (knownPrimes.every(p => currentCandidate % p !== 0)) {
            knownPrimes.push(currentCandidate); // Append the newly found prime.
        }
    }

    // An object to meticulously record the frequency of each prime factor encountered.
    const factorCountsMap = {};

    // Execute the prime factorization procedure using the compiled list of primes.
    for (let currentPrime of knownPrimes) {
        while (numberToFactor % currentPrime === 0) {
            numberToFactor /= currentPrime; // Repeatedly divide by the prime until it's no longer a factor.
            factorCountsMap[currentPrime] = (factorCountsMap[currentPrime] || 0) + 1; // Increment its count.
        }
    }

    // After exhausting all known primes, if the number still isn't 1, the remainder is also a prime factor.
    if (numberToFactor !== 1) {
        factorCountsMap[numberToFactor] = (factorCountsMap[numberToFactor] || 0) + 1;
    }

    // Initialize an aggregator for the final product, starting with a neutral multiplicative identity.
    let totalAccumulated = 1;
    // Define a large constant for modular arithmetic, crucial for preventing integer overflow.
    const largeModulo = Math.pow(10, 9) + 7;

    /**
     * Computes the number of ways to choose 'selectElements' items from 'totalElements' items (combinations).
     * This function implements the standard combination formula (nCk).
     * @param {number} totalElements - The comprehensive count of available items.
     * @param {number} selectElements - The specific quantity of items to be chosen.
     * @returns {number} The calculated number of combinations.
     */
    const computeCombinations = function(totalElements, selectElements) {
        // Exploit the symmetry of combinations (nCk = nC(n-k)) to reduce calculation steps.
        selectElements = Math.min(selectElements, totalElements - selectElements);
        let currentProduct = 1;

        // Compute the numerator part of the combination formula (n * (n-1) * ... * (n-k+1)).
        for (let idx = 0; idx < selectElements; idx++) {
            currentProduct *= (totalElements - idx);
        }

        // Compute the denominator part (k!).
        for (let idx = 0; idx < selectElements; idx++) {
            currentProduct /= (idx + 1);
        }
        return currentProduct;
    };

    // Important consideration: This combination utility may encounter floating-point inaccuracies
    // with extremely large inputs. A more robust solution for such cases would involve modular inverse.
    // For the current problem scope, it should function adequately.

    // Iterate through each prime factor and its corresponding count stored in our map.
    for (let factorId in factorCountsMap) {
        let factorOccurrence = factorCountsMap[factorId];
        // Calculate the number of combinations using the "stars and bars" method: (val + N - 1) choose val.
        let singleCombination = computeCombinations(factorOccurrence + countParam - 1, factorOccurrence);
        totalAccumulated *= singleCombination; // Integrate this combination into the running total.
        totalAccumulated %= largeModulo; // Apply the modulo operation to keep the number within bounds.
    }

    return totalAccumulated; // Deliver the ultimate computed result.
}

// This section contains auxiliary code responsible for managing diverse execution environments.
// It is distinct from the primary algorithmic logic of the 'CalculateResult' function.

((execInput, execResult, execType) => {
    // Determine if the current execution context is Node.js (e.g., for standard input/output).
    if (typeof require !== "undefined") {
        console.log(CalculateResult(require("node:fs").readFileSync("/dev/stdin", "utf8")));
    } else {
        // If not Node.js, assume a browser environment for interactive testing or debugging.
        // Extract the test input embedded in the template literal.
        execInput = execInput.split("\n").slice(1, -1).join("\n");
        execResult = (() => {
            try {
                return CalculateResult(execInput);
            } catch (error) {
                return error.stack || error.message;
            }
        })();
        execType = typeof execResult;

        // Ensure the output is a string for consistent display in a text area.
        if (execType !== "string") {
            execResult = JSON.stringify(execResult);
        }

        // Employ a DOM manipulation utility (potentially jQuery or a custom fallback) to display results.
        // This part relies on a global '$' if available, otherwise provides a basic DOM appending mechanism.
        const domUtil = typeof $ !== 'undefined' ? $ : (selector) => ({
            append: (elements) => {
                const target = document.querySelector(selector || 'body');
                if (target) {
                    elements.forEach(el => target.appendChild(el));
                }
            }
        });

        domUtil("<form>").append(
            [
                [10, execInput], 0,
                [1, execType], 0,
                [10, execResult]
            ].map(itemSpec => {
                // For each specification, create either a textarea or a line break element.
                if (itemSpec) {
                    const textareaElement = document.createElement("textarea");
                    textareaElement.rows = itemSpec[0];
                    textareaElement.cols = 40;
                    textareaElement.textContent = itemSpec[1];
                    return textareaElement;
                } else {
                    return document.createElement("br");
                }
            })
        ).appendTo("body");
    }
})(`
3 12
`);