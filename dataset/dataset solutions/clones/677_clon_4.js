// This program determines the maximum improvement in a sub-sequence sum after a single element exchange.

// Custom exception handling to replace OCaml's raise mechanisms.
function signalIssue(category, message) {
    throw new Error(`Reported ${category}: ${message}`);
}

// Global category identifiers for various error conditions.
const issueCategories = {
    inputStructure: "ParseFailure",
    valueRange: "BoundsViolation",
    calculationError: "ComputeProblem",
    programTermination: "ProcessExit"
};

// Utility for repeating a character (replaces caml_str_repeat).
function replicateChar(count, character) {
    if (count <= 0) return "";
    return String(character).repeat(count);
}

// Represents a sequence of characters, simulating OCaml's MlString.
// Supports internal caching for string, byte, and character code array representations.
class CharacterSequence {
    constructor(initialContent) {
        this.stringForm = initialContent !== null && initialContent !== undefined ? String(initialContent) : "";
        this.cachedLength = this.stringForm.length;
        this.charCodeArray = null; // Stored as an array of numerical char codes for mutable behavior.
    }

    // Provides the standard JavaScript string representation (replaces toJsString, toString, valueOf).
    getStringRepresentation() {
        return this.stringForm;
    }

    // Retrieves the array of character codes, initializing it if necessary (replaces toArray, getArray).
    getCharacterCodeArray() {
        if (this.charCodeArray === null) {
            this.charCodeArray = Array.from(this.stringForm, char => char.charCodeAt(0));
        }
        return this.charCodeArray;
    }

    // Returns the cached length of the sequence (replaces getLen).
    getLength() {
        return this.cachedLength;
    }

    // Fetches the character code at a specific index (replaces get).
    fetchCode(index) {
        const codes = this.getCharacterCodeArray();
        if (index < 0 || index >= codes.length) return 0; // OCaml returns 0 for out-of-bounds access.
        return codes[index];
    }

    // Fetches the character code with bounds checking (replaces safeGet).
    secureFetchCode(index) {
        if (index < 0 || index >= this.getLength()) {
            signalIssue(issueCategories.valueRange, "Index for character retrieval is outside valid range.");
        }
        return this.fetchCode(index);
    }

    // Modifies the character code at a specific index (replaces set).
    // This operation rebuilds the internal string representation.
    modifyCode(index, newCodeValue) {
        const codes = this.getCharacterCodeArray();
        const adjustedCode = newCodeValue & 0xff; // Ensure value fits in a byte.

        if (index < 0) return 0; // Invalid index.

        // If setting beyond current length, extend with zero-filled characters.
        if (index >= codes.length) {
            for (let i = codes.length; i < index; i++) {
                codes[i] = 0;
            }
            codes.push(adjustedCode);
        } else {
            codes[index] = adjustedCode;
        }

        // Rebuild string form and update cached length.
        this.stringForm = codes.map(code => String.fromCharCode(code)).join('');
        this.cachedLength = this.stringForm.length;
        return 0; // OCaml's set returns 0.
    }

    // Modifies the character code with bounds checking (replaces safeSet).
    secureModifyCode(index, newCodeValue) {
        if (index < 0 || index >= this.getLength()) {
            signalIssue(issueCategories.valueRange, "Index for character modification is outside valid range.");
        }
        this.modifyCode(index, newCodeValue);
    }

    // Compares this sequence to another (replaces compare).
    compareWith(otherSequence) {
        const s1 = this.getStringRepresentation();
        const s2 = otherSequence.getStringRepresentation();
        if (s1 < s2) return -1;
        if (s1 > s2) return 1;
        return 0;
    }

    // Checks for equality with another sequence (replaces equal).
    checkEquality(otherSequence) {
        return this.getStringRepresentation() === otherSequence.getStringRepresentation();
    }
}

// A simple wrapper for strings that extends CharacterSequence (replaces MlWrappedString).
class StringWrapper extends CharacterSequence {
    constructor(text) {
        super(text);
    }
}

// Parses a string into an integer, mimicking OCaml's int_of_string behavior.
// Includes handling for signs, bases (decimal, hex, octal, binary), and overflow checks for 31-bit signed integers.
function interpretAsInteger(textSequence) {
    const rawContent = textSequence.getStringRepresentation();
    let scanPosition = 0;
    let currentSign = 1;
    let currentBase = 10;

    // Detect and apply sign.
    if (rawContent.charCodeAt(scanPosition) === 45 /* '-' */) {
        currentSign = -1;
        scanPosition++;
    }

    // Detect and apply base prefix (0x, 0o, 0b).
    if (rawContent.charCodeAt(scanPosition) === 48 /* '0' */) {
        const nextCharacter = rawContent.charCodeAt(scanPosition + 1);
        switch (nextCharacter) {
            case 120: // 'x'
            case 88:  // 'X'
                currentBase = 16;
                scanPosition += 2;
                break;
            case 111: // 'o'
            case 79:  // 'O'
                currentBase = 8;
                scanPosition += 2;
                break;
            case 98:  // 'b'
            case 66:  // 'B'
                currentBase = 2;
                scanPosition += 2;
                break;
        }
    }

    let parsedMagnitude = 0;
    let charCodeValue;
    let digitValue;
    let digitFound = false;

    // OCaml 31-bit signed integer limits.
    const MAX_POSITIVE_MAGNITUDE = 1073741823; // 2^30 - 1
    const MAX_NEGATIVE_MAGNITUDE = 1073741824; // 2^30

    for (let i = scanPosition; i < rawContent.length; i++) {
        charCodeValue = rawContent.charCodeAt(i);
        if (charCodeValue === 95 /* '_' */) continue; // Skip underscores.

        digitValue = -1;
        if (charCodeValue >= 48 && charCodeValue <= 57) digitValue = charCodeValue - 48; // '0'-'9'
        else if (charCodeValue >= 65 && charCodeValue <= 90) digitValue = charCodeValue - 55; // 'A'-'Z'
        else if (charCodeValue >= 97 && charCodeValue <= 122) digitValue = charCodeValue - 87; // 'a'-'z'

        if (digitValue < 0 || digitValue >= currentBase) {
            // If no digits were found before a non-digit character, it's an error.
            if (!digitFound) {
                signalIssue(issueCategories.inputStructure, "Integer parsing: No valid digits found.");
            }
            // Check for invalid trailing characters (only underscores are allowed).
            for (let j = i; j < rawContent.length; j++) {
                if (rawContent.charCodeAt(j) !== 95) {
                    signalIssue(issueCategories.inputStructure, "Integer parsing: Invalid trailing characters after number.");
                }
            }
            break; // Stop digit parsing.
        }
        digitFound = true;

        // Pre-check for magnitude overflow before multiplication.
        const magnitudeLimit = (currentSign === -1) ? MAX_NEGATIVE_MAGNITUDE : MAX_POSITIVE_MAGNITUDE;
        if (parsedMagnitude > Math.floor(magnitudeLimit / currentBase) ||
            (parsedMagnitude === Math.floor(magnitudeLimit / currentBase) && digitValue > (magnitudeLimit % currentBase))) {
            signalIssue(issueCategories.valueRange, "Integer magnitude exceeds OCaml 31-bit limit.");
        }
        
        parsedMagnitude = parsedMagnitude * currentBase + digitValue;
        scanPosition = i; // Update scanPosition to the last successfully processed digit.
    }

    if (!digitFound) {
        signalIssue(issueCategories.inputStructure, "Integer parsing: No digits found after sign or base prefix.");
    }
    
    const finalNumericalValue = currentSign * parsedMagnitude;

    // Final check for OCaml 31-bit signed integer range.
    if (finalNumericalValue < -MAX_NEGATIVE_MAGNITUDE || finalNumericalValue > MAX_POSITIVE_MAGNITUDE) {
        signalIssue(issueCategories.valueRange, "Final integer value is outside OCaml 31-bit signed range.");
    }
    
    return finalNumericalValue;
}

// Calculates the maximum sum of a contiguous sub-array of a specified fixed window size.
// (Replaces the core logic of aN function).
function determineMaxFixedWindowSum(numericData, windowLength) {
    const dataCount = numericData.length;

    if (windowLength === 0) return 0; // If window size is zero, sum is zero.
    if (windowLength > dataCount) {
        // If window size exceeds data length, no valid window can be formed, sum is zero.
        return 0;
    }

    let currentWindowAccumulation = 0;
    // Calculate sum for the first window.
    for (let i = 0; i < windowLength; i++) {
        currentWindowAccumulation += numericData[i];
    }

    let overallHighestAccumulation = currentWindowAccumulation;

    // Slide the window across the rest of the data.
    for (let i = windowLength; i < dataCount; i++) {
        currentWindowAccumulation += numericData[i] - numericData[i - windowLength]; // Add new element, remove old.
        overallHighestAccumulation = Math.max(overallHighestAccumulation, currentWindowAccumulation);
    }

    return overallHighestAccumulation;
}

// Main program entry point (replaces the anonymous IIFE).
(function entryPoint() {
    const fileIO = require("fs");
    const rawInputContent = fileIO.readFileSync("/dev/stdin", "utf8");

    // Split input into tokens, filter out empty strings.
    const inputTokens = rawInputContent.trim().split(/\s+/).filter(Boolean);
    let currentTokenPosition = 0;

    // Process input in a loop, handling each "game" or problem instance.
    while (currentTokenPosition < inputTokens.length) {
        // Extract game parameters: number of swappable elements (N) and window size (K).
        const swapCount = interpretAsInteger(new StringWrapper(inputTokens[currentTokenPosition++]));
        const targetWindowSize = interpretAsInteger(new StringWrapper(inputTokens[currentTokenPosition++]));

        // Termination condition: N=0 and K=0 signals the end of input.
        if (swapCount === 0 && targetWindowSize === 0) {
            return; // Exit the program.
        }

        // Extract the sequence of numbers for this game.
        // The sequence length is determined by 'swapCount' (N).
        const gameSequenceTokens = inputTokens.slice(currentTokenPosition, currentTokenPosition + swapCount);
        const gameSequenceNumbers = gameSequenceTokens.map(token => interpretAsInteger(new StringWrapper(token)));
        currentTokenPosition += swapCount; // Advance position for next game.

        // Calculate the maximum sum without performing any swaps.
        const initialMaxSum = determineMaxFixedWindowSum(gameSequenceNumbers, targetWindowSize);

        let bestSumAfterSingleSwap = initialMaxSum; // Initialize with the no-swap sum.

        // Iterate through all possible pairs of indices (i, j) within the swappable elements.
        for (let idxA = 0; idxA < swapCount; idxA++) {
            for (let idxB = 0; idxB < swapCount; idxB++) {
                // Create a temporary copy of the sequence to perform the swap.
                const sequenceAfterSwap = [...gameSequenceNumbers];
                
                // Perform the swap if indices are different.
                if (idxA !== idxB) {
                    [sequenceAfterSwap[idxA], sequenceAfterSwap[idxB]] = [sequenceAfterSwap[idxB], sequenceAfterSwap[idxA]];
                }
                
                // Calculate the maximum sum for the sequence after this particular swap.
                const currentSwapSum = determineMaxFixedWindowSum(sequenceAfterSwap, targetWindowSize);
                
                // Update the overall best sum found so far.
                bestSumAfterSingleSwap = Math.max(bestSumAfterSingleSwap, currentSwapSum);
            }
        }

        // Output the result based on whether a swap improved the sum.
        if (bestSumAfterSingleSwap < initialMaxSum) {
            console.log("NO GAME"); // Matches the original's "NO GAME" message.
        } else {
            console.log(bestSumAfterSingleSwap - initialMaxSum); // Output the improvement.
        }
    }
})();