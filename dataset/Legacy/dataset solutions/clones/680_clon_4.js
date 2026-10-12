const fileSystem = require("fs");

/**
 * Custom error type to distinguish parsing failures from other errors,
 * mimicking OCaml's specific error tags for `int_of_string`.
 */
class InputParsingError extends Error {
    constructor(message) {
        super(message);
        this.name = "InputParsingError";
    }
}

/**
 * Strictly parses a string into an integer, mimicking OCaml's `int_of_string` behavior.
 * Handles sign, base prefixes (0x, 0o, 0b), and underscores as separators.
 * Throws `InputParsingError` on invalid format or overflow (31-bit signed integer).
 * @param {string} inputString The string to parse.
 * @returns {number} The parsed integer.
 */
function parseStrictInteger(inputString) {
    let currentIndex = 0;
    let numberSign = 1;
    let numberBase = 10;

    // Handle sign
    if (inputString.charCodeAt(currentIndex) === 45 /* '-' */) {
        numberSign = -1;
        currentIndex++;
    }

    // Handle base prefix (0x, 0o, 0b)
    if (inputString.charCodeAt(currentIndex) === 48 /* '0' */) {
        const nextChar = inputString.charCodeAt(currentIndex + 1);
        switch (nextChar) {
            case 120: // 'x'
            case 88:  // 'X'
                numberBase = 16;
                currentIndex += 2;
                break;
            case 111: // 'o'
            case 79:  // 'O'
                numberBase = 8;
                currentIndex += 2;
                break;
            case 98:  // 'b'
            case 66:  // 'B'
                numberBase = 2;
                currentIndex += 2;
                break;
        }
    }

    let parsedValue = 0;
    let digitEncountered = false;

    while (currentIndex < inputString.length) {
        let charCode = inputString.charCodeAt(currentIndex);
        if (charCode === 95 /* '_' */) {
            currentIndex++;
            continue;
        }

        let digitValue;
        if (charCode >= 48 && charCode <= 57) { // '0'-'9'
            digitValue = charCode - 48;
        } else if (charCode >= 65 && charCode <= 90) { // 'A'-'Z'
            digitValue = charCode - 55;
        } else if (charCode >= 97 && charCode <= 122) { // 'a'-'z'
            digitValue = charCode - 87;
        } else {
            digitValue = -1; // Not a valid digit character
        }

        if (digitValue < 0 || digitValue >= numberBase) {
            break; // Invalid digit for the current base or end of number
        }

        digitEncountered = true;

        // OCaml integers are 31-bit signed. Max positive: 2^30 - 1. Max negative: -2^30.
        const MAX_OCAML_ABS_VALUE = 1073741824; // 2^30

        // Check for potential overflow before multiplication and addition
        // This threshold check mimics the original OCaml logic's overflow detection.
        if (parsedValue > (MAX_OCAML_ABS_VALUE - digitValue) / numberBase) {
            throw new InputParsingError("int_of_string");
        }

        parsedValue = numberBase * parsedValue + digitValue;
        currentIndex++;
    }

    // If no digits were found or there are trailing characters after the number
    if (!digitEncountered || currentIndex !== inputString.length) {
        throw new InputParsingError("int_of_string");
    }

    // Final overflow check after applying sign
    if (numberSign === 1 && parsedValue > (MAX_OCAML_ABS_VALUE - 1)) {
        throw new InputParsingError("int_of_string");
    }
    if (numberSign === -1 && parsedValue > MAX_OCAML_ABS_VALUE) {
        throw new InputParsingError("int_of_string");
    }

    return numberSign * parsedValue;
}

/**
 * Performs 31-bit signed integer multiplication, mimicking OCaml's `caml_mul`.
 * This is a specific implementation from the OCaml-to-JS compiler.
 * It handles potential precision issues with large numbers in JS floats
 * before the final `|0` truncation to a 32-bit signed integer.
 * @param {number} x
 * @param {number} y
 * @returns {number} The 32-bit signed integer result, which OCaml interprets as 31-bit.
 */
function performIntegerMultiplication(x, y) {
    // The original `caml_mul` uses `>> 16` (signed right shift) for the high part.
    // It then adds the low part and truncates to 32-bit signed integer with `|0`.
    return ((((x >> 16) * y) << 16) + (x & 0xffff) * y) | 0;
}

/**
 * Calculates the maximum product of 'windowSize' consecutive elements in an array.
 * Uses `performIntegerMultiplication` to mimic OCaml's integer arithmetic.
 * @param {number} windowSize The size of the sliding window.
 * @param {number[]} numberSequence The array of numbers.
 * @returns {number} The maximum product found, or -1 if the window size is larger than the sequence.
 */
function findMaxWindowProduct(windowSize, numberSequence) {
    if (windowSize <= 0) {
        throw new Error("Window size must be positive.");
    }
    if (numberSequence.length < windowSize) {
        return -1; // Mimics original behavior for out-of-bounds window
    }

    let overallMaximumProduct = -Infinity;

    for (let i = 0; i <= numberSequence.length - windowSize; i++) {
        let currentWindowProduct = 1;
        for (let j = 0; j < windowSize; j++) {
            // Use the OCaml-specific multiplication for each step
            currentWindowProduct = performIntegerMultiplication(currentWindowProduct, numberSequence[i + j]);
        }
        overallMaximumProduct = Math.max(overallMaximumProduct, currentWindowProduct);
    }
    return overallMaximumProduct;
}

/**
 * Main function to process input and solve the problem.
 */
function executeGameLogic() {
    const rawInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
    // Split by one or more whitespace characters and filter out empty strings
    const inputTokens = rawInputContent.split(/\s+/).filter(token => token.length > 0);

    let tokenPointer = 0;

    while (true) {
        // Ensure there are enough tokens for N and M
        if (tokenPointer + 1 >= inputTokens.length) {
            // If the loop terminates due to 0 0, this error won't be hit.
            // If it's malformed input, it should throw "Failure: get_input".
            throw new Error("Failure: get_input");
        }

        let countN, windowM;
        try {
            countN = parseStrictInteger(inputTokens[tokenPointer]);
            windowM = parseStrictInteger(inputTokens[tokenPointer + 1]);
        } catch (e) {
            if (e instanceof InputParsingError) {
                throw new Error("Failure: get_input"); // Mimic original error for bad input format
            }
            throw e; // Re-throw other unexpected errors
        }

        // Termination condition: N=0, M=0
        if (countN === 0 && windowM === 0) {
            break;
        }

        tokenPointer += 2; // Advance past N and M

        // Ensure there are enough tokens for the 'N' numbers
        if (tokenPointer + countN > inputTokens.length) {
            throw new Error("Failure: get_input");
        }

        const currentNumbers = [];
        for (let i = 0; i < countN; i++) {
            try {
                currentNumbers.push(parseStrictInteger(inputTokens[tokenPointer + i]));
            } catch (e) {
                if (e instanceof InputParsingError) {
                    throw new Error("Failure: get_input");
                }
                throw e;
            }
        }
        tokenPointer += countN; // Advance past the 'N' numbers

        // Calculate the maximum product for the original sequence
        const maxProductInitial = findMaxWindowProduct(windowM, currentNumbers);

        let maxProductAfterAnySingleSwap = maxProductInitial; // Initialize with the original max

        // Iterate through all unique pairs of indices (i, j) to perform a single swap
        for (let i = 0; i < countN; i++) {
            for (let j = i + 1; j < countN; j++) { // j starts from i+1 to avoid redundant swaps and self-swaps
                // Perform the swap
                [currentNumbers[i], currentNumbers[j]] = [currentNumbers[j], currentNumbers[i]];

                // Calculate the maximum product for the sequence after this specific swap
                const productAfterSwap = findMaxWindowProduct(windowM, currentNumbers);
                
                // Update the overall maximum product found after any single swap
                maxProductAfterAnySingleSwap = Math.max(maxProductAfterAnySingleSwap, productAfterSwap);

                // Swap back to restore the original order for the next iteration
                [currentNumbers[i], currentNumbers[j]] = [currentNumbers[j], currentNumbers[i]];
            }
        }

        // Determine and print the result based on the comparison
        if (maxProductAfterAnySingleSwap < maxProductInitial) {
            console.log("NO GAME");
        } else {
            console.log(maxProductAfterAnySingleSwap - maxProductInitial);
        }
    }
}

// Execute the main game logic.
// Any unhandled errors will propagate and terminate the program,
// mimicking the original OCaml runtime's behavior for top-level exceptions.
executeGameLogic();
