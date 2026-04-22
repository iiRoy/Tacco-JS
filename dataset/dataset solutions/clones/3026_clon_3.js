var InputProcessor = (function () {
    // Internal class to manage the parsing of input data.
    function LineDataParser(sourceText) {
        // Store the original lines of input, trimmed and split.
        this._sourceLines = sourceText.trim().split("\n");
        // Keep track of the current line being processed.
        this._currentLineIndex = 0;
        // Temporary storage for tokens from the current line.
        this._currentLineTokens = [];
    }

    // Helper method to ensure the current line's tokens are loaded and ready.
    LineDataParser.prototype._prepareLineTokens = function () {
        if (this._currentLineTokens.length === 0 && this._currentLineIndex < this._sourceLines.length) {
            const currentLine = this._sourceLines[this._currentLineIndex];
            // Split by space, filter out empty strings, and reverse for efficient popping.
            this._currentLineTokens = currentLine.split(" ").filter(Boolean).reverse();
            // If the line was empty or only contained spaces, ensure tokens is still empty
            // to avoid infinite loops if 'pop' is called repeatedly.
            if (this._currentLineTokens.length === 0) {
                this._currentLineIndex++; // Move to next line if current one was empty
            }
        }
    };

    // Reads a single value from the current line. Moves to the next line if current is exhausted.
    LineDataParser.prototype.readNextValue = function (returnAsString) {
        this._prepareLineTokens(); // Ensure tokens are loaded

        if (this._currentLineTokens.length === 0) {
            // If no tokens left on current line, advance to next and try again.
            this._currentLineIndex++;
            this._prepareLineTokens();
            if (this._currentLineTokens.length === 0) {
                // If still no tokens, we've run out of input.
                // Depending on context, might throw an error or return undefined.
                return undefined;
            }
        }

        const valueToken = this._currentLineTokens.pop();
        if (this._currentLineTokens.length === 0) {
            // If the line is now empty, advance the line index for the next read.
            this._currentLineIndex++;
        }

        // Return as string or convert to number.
        return returnAsString ? valueToken : Number(valueToken);
    };

    // Reads an entire line of values.
    LineDataParser.prototype.readLineOfValues = function (asStringsFlag) {
        // Ensure we don't go out of bounds.
        if (this._currentLineIndex >= this._sourceLines.length) {
            return undefined; // Or throw an error indicating end of input
        }
        const currentLineText = this._sourceLines[this._currentLineIndex++];
        const values = currentLineText.split(" ").filter(Boolean);
        // Convert to numbers if requested, otherwise return strings.
        return asStringsFlag ? values : values.map(val => Number(val));
    };

    // Reads a block of 'count' lines, each split into an array of values (forming a matrix).
    LineDataParser.prototype.readMatrixBlock = function (count, asStringsFlag) {
        if (count <= 0) {
            return []; // Return empty for invalid counts
        }
        // Slice the relevant lines from the source.
        const relevantLines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex + count);
        this._currentLineIndex += count; // Advance the line index.

        // Map each line to an array of values.
        return relevantLines.map(line => {
            const values = line.split(" ").filter(Boolean);
            return asStringsFlag ? values : values.map(val => Number(val));
        });
    };

    // Reads a block of 'count' lines, treating each line as a single value.
    LineDataParser.prototype.readValuesAsArray = function (count, asStringsFlag) {
        if (count <= 0) {
            return []; // Return empty for invalid counts
        }
        // Slice the relevant lines from the source.
        const relevantLines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex + count);
        this._currentLineIndex += count; // Advance the line index.

        // Convert each line to a single value.
        return asStringsFlag ? relevantLines : relevantLines.map(val => Number(val));
    };

    // The factory function that creates and returns a new parser instance.
    return function createInputParser(textData) {
        return new LineDataParser(textData);
    };
})();

// Initialize the input handler by reading from standard input.
var inputHandler;
try {
    const fileSystem = require("fs");
    const inputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
    inputHandler = InputProcessor(inputContent);
} catch (error) {
    console.error("Failed to read input from /dev/stdin:", error);
    // Provide a fallback or exit if input is essential.
    inputHandler = InputProcessor(""); // Empty parser if read fails
}


// Function to create multi-dimensional arrays dynamically.
function initializeNestedArray(initialValueExpression) {
    const dimensions = Array.from(arguments).slice(1); // Get all arguments after the first one.
    const numDimensions = dimensions.length;

    if (numDimensions === 0) {
        // If no dimensions, just return the initial value.
        return eval(initialValueExpression);
    }

    // Construct the array creation string iteratively.
    let arrayCreationString = `Array(${dimensions[numDimensions - 1]}).fill(0).map(() => { return ${initialValueExpression}; })`;
    for (let i = numDimensions - 2; i >= 0; i--) {
        arrayCreationString = `Array(${dimensions[i]}).fill(0).map(() => ${arrayCreationString})`;
    }
    // Use eval to execute the dynamically generated array creation code.
    return eval(arrayCreationString);
}

// Computes the Greatest Common Divisor (GCD) of two numbers using the Euclidean algorithm.
function calculateGCD(numA, numB) {
    // Ensure inputs are non-negative for consistent behavior.
    numA = Math.abs(numA);
    numB = Math.abs(numB);

    // Base case: if numB is 0, numA is the GCD.
    if (numB === 0) {
        return numA;
    }
    // Recursive step: GCD(numA, numB) = GCD(numB, numA % numB).
    return calculateGCD(numB, numA % numB);
}

// Main execution function.
mainProgram();

function mainProgram() {
    // Read the number of elements.
    const numberOfElements = inputHandler.readNextValue();
    if (typeof numberOfElements !== 'number' || numberOfElements < 0) {
        console.error("Invalid number of elements provided.");
        return;
    }

    // Read the array of numbers. The problem implies n+1 elements from index 0 to n.
    const numberSequence = inputHandler.readValuesAsArray(numberOfElements + 1);
    if (!Array.isArray(numberSequence) || numberSequence.length !== numberOfElements + 1) {
        console.error("Input sequence does not match expected length.");
        return;
    }

    // Calculate the GCD of all elements in the sequence.
    let commonDivisor = numberSequence[0];
    for (let i = 1; i <= numberOfElements; i++) {
        commonDivisor = calculateGCD(commonDivisor, numberSequence[i]);
    }

    // Find the prime factors of the absolute value of the common divisor.
    const potentialFactors = retrievePrimeFactors(Math.abs(commonDivisor));

    // Normalize the input sequence by dividing each element by the common divisor.
    const normalizedSequence = numberSequence.map(val => val / commonDivisor);

    // Special handling if the last element of the normalized sequence is zero.
    // In this specific problem context, it implies considering primes up to 'numberOfElements'.
    let candidatePrimesForLastElement;
    if (normalizedSequence[numberOfElements] === 0) {
        candidatePrimesForLastElement = generatePrimesUpTo(numberOfElements);
    } else {
        // Otherwise, find prime factors of the last element's absolute value.
        candidatePrimesForLastElement = retrievePrimeFactors(Math.abs(normalizedSequence[numberOfElements]));
    }

    // Iterate through the candidate primes.
    for (const currentPrime of candidatePrimesForLastElement) {
        // Skip if this prime is already a potential factor or if it's too large for the current context.
        if (potentialFactors.has(currentPrime) || numberOfElements < currentPrime) {
            continue;
        }

        let isArithmeticProgressionModulo = true; // Flag to check condition.
        const progressionStep = currentPrime - 1; // The step size for the arithmetic progression check.

        // Check if the sequence forms an arithmetic progression modulo 'currentPrime'
        // for each starting position 'i' from 0 to 'progressionStep - 1'.
        for (let i = 0; i < progressionStep && isArithmeticProgressionModulo; i++) {
            let currentSumModulo = 0;
            // Sum elements at indices i, i + progressionStep, i + 2*progressionStep, ...
            for (let j = i; j <= numberOfElements; j += progressionStep) {
                currentSumModulo += normalizedSequence[j];
            }
            // If the sum is not divisible by 'currentPrime', this prime is not a valid factor.
            if (currentSumModulo % currentPrime !== 0) {
                isArithmeticProgressionModulo = false;
            }
        }

        // If all checks passed, add this prime to the potential factors.
        if (isArithmeticProgressionModulo) {
            potentialFactors.add(currentPrime);
        }
    }

    // Output the unique prime factors in sorted order.
    if (potentialFactors.size > 0) {
        const sortedFactors = Array.from(potentialFactors).sort((val1, val2) => val1 - val2);
        console.log(sortedFactors.join("\n"));
    } else {
        // Optionally, print an empty line or a specific message if no factors are found.
        console.log("");
    }
}

// Determines all unique prime factors of a given positive integer.
function retrievePrimeFactors(numberToFactorize) {
    const factorsSet = new Set();
    // Handle negative input by taking its absolute value.
    let currentNumber = Math.abs(numberToFactorize);

    if (currentNumber < 2) {
        return factorsSet; // No prime factors for numbers less than 2.
    }

    // Check for 2 as a factor.
    if (currentNumber % 2 === 0) {
        factorsSet.add(2);
        while (currentNumber % 2 === 0) {
            currentNumber /= 2;
        }
    }

    // Check for odd factors starting from 3 up to the square root of the remaining number.
    for (let divisor = 3; divisor * divisor <= currentNumber; divisor += 2) {
        if (currentNumber % divisor === 0) {
            factorsSet.add(divisor);
            while (currentNumber % divisor === 0) {
                currentNumber /= divisor;
            }
        }
    }

    // If after all divisions, currentNumber is greater than 1, it must be a prime factor itself.
    if (currentNumber > 1) {
        factorsSet.add(currentNumber);
    }
    return factorsSet;
}

// Generates a set of all prime numbers up to a specified limit 'n' using the Sieve of Eratosthenes.
function generatePrimesUpTo(limit) {
    const primeNumbersSet = new Set();
    if (limit < 2) {
        return primeNumbersSet; // No primes below 2.
    }

    // Initialize a boolean array 'isPrime' where isPrime[i] is true if i is potentially prime.
    const isPrime = new Array(limit + 1).fill(true);
    isPrime[0] = false; // 0 is not prime
    isPrime[1] = false; // 1 is not prime

    // Iterate from 2 up to the limit.
    for (let currentNum = 2; currentNum <= limit; currentNum++) {
        if (isPrime[currentNum]) {
            // If currentNum is prime, add it to our set.
            primeNumbersSet.add(currentNum);
            // Mark all multiples of currentNum as not prime.
            for (let multiple = currentNum * currentNum; multiple <= limit; multiple += currentNum) {
                isPrime[multiple] = false;
            }
        }
    }
    return primeNumbersSet;
}