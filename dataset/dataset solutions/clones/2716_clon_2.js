// This module provides utilities for parsing input from stdin.
var INPUT_PARSER = (function() {
    /**
     * Creates a new input reader instance.
     * @param {string} inputString - The raw input string.
     * @returns {InputReader} A new InputReader object.
     */
    function createInputReader(inputString) {
        return new InputReader(inputString);
    }

    /**
     * Constructor for the InputReader.
     * @param {string} inputString - The raw input string.
     */
    function InputReader(inputString) {
        // Store lines of input, trimmed and split by newline.
        this._lines = inputString.trim().split("\n");
        // Initialize current line index.
        this._currentLineIndex = 0;
    }

    /**
     * Reads the next token from the current line. If the current line is exhausted,
     * it moves to the next line. Tokens are read in reverse order of appearance on the line.
     * @param {boolean} asString - If true, returns the token as a string; otherwise, as a number.
     * @returns {string|number} The next token.
     */
    InputReader.prototype.readNextToken = function(asString) {
        var currentLines = this._lines;
        var lineIdx = this._currentLineIndex;
        var resultToken;

        // If the current line hasn't been processed into tokens yet, do so.
        if (typeof currentLines[lineIdx] === "string") {
            currentLines[lineIdx] = currentLines[lineIdx].split(" ").reverse();
        }

        // Pop the last token (which was originally the first due to reverse).
        resultToken = currentLines[lineIdx].pop();

        // If the current line is now empty, advance to the next line.
        if (!currentLines[lineIdx].length) {
            this._currentLineIndex++;
        }

        // Return as string or number based on the flag.
        return asString ? resultToken : +resultToken;
    };

    /**
     * Reads all tokens from the current line and advances to the next line.
     * @param {boolean} asString - If true, returns tokens as strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array of tokens from the line.
     */
    InputReader.prototype.readLineTokens = function(asString) {
        var lineTokens = this._lines[this._currentLineIndex++].split(" ");
        return asString ? lineTokens : lineTokens.map(item => +item);
    };

    /**
     * Reads a matrix of 'numRows' rows, where each row is split into tokens.
     * Advances the current line index by 'numRows'.
     * @param {number} numRows - The number of rows to read.
     * @param {boolean} asString - If true, returns elements as strings; otherwise, as numbers.
     * @returns {Array<Array<string|number>>} The matrix.
     */
    InputReader.prototype.readMatrix = function(numRows, asString) {
        var resultMatrix = this._lines.slice(this._currentLineIndex, this._currentLineIndex += numRows).map(item => item.split(" "));
        return asString ? resultMatrix : resultMatrix.map(item => item.map(subItem => +subItem));
    };

    /**
     * Reads 'numLines' raw lines of input.
     * Advances the current line index by 'numLines'.
     * @param {number} numLines - The number of lines to read.
     * @param {boolean} asString - If true, returns lines as strings; otherwise, attempts to convert to number.
     * @returns {Array<string|number>} An array of lines.
     */
    InputReader.prototype.readLines = function(numLines, asString) {
        var resultLines = this._lines.slice(this._currentLineIndex, this._currentLineIndex += numLines);
        return asString ? resultLines : resultLines.map(item => +item);
    };

    return createInputReader;
})();

// Initialize the input parser with content from stdin.
var inputData = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array initialized with a given value.
 * @param {*} initialValue - The value to initialize array elements with.
 * @param {...number} dimensions - The dimensions of the array (e.g., dim1, dim2, dim3).
 * @returns {Array} The initialized multi-dimensional array.
 */
function initializeMultiDimArray(initialValue) {
    var args = arguments;
    var argLength = args.length;
    // Construct the string for array creation using eval.
    var arrayCreationString = "Array(args[" + --argLength + "]).fill(0).map(x=>{return " + initialValue + ";})";
    while (--argLength) {
        arrayCreationString = "Array(args[" + argLength + "]).fill(0).map(x=>" + arrayCreationString + ")";
    }
    return eval(arrayCreationString);
}

// Rolling Hash implementation for string searching.
var StringHasher = (function() {
    // Two different bases for polynomial hashing to reduce collision probability.
    var hashBases = [1009, 1007];
    // Two different large prime moduli.
    var hashModuli = [1e9 + 7, 1e9 + 9];
    // Stores powers of bases modulo respective moduli. powerValues[j][i] = hashBases[j]^i % hashModuli[j]
    var powerValues = [
        [],
        []
    ];
    // Stores prefix hashes. prefixHashes[j][i] = hash of s[0...i-1] using hashBases[j] and hashModuli[j]
    var prefixHashes = [
        [],
        []
    ];
    // Current length of the string being hashed.
    var currentStringLength;

    /**
     * Factory function to create a new StringHasher instance.
     * @param {string} inputStr - The string to hash.
     * @returns {StringHasher} A new StringHasher object.
     */
    function createStringHasher(inputStr) {
        return new StringHasher(inputStr);
    }

    /**
     * Constructor for StringHasher. Computes initial hashes for the given string.
     * @param {string} inputStr - The string to hash.
     */
    function StringHasher(inputStr) {
        currentStringLength = this.size = inputStr.length; // 'size' is also a property of the instance.

        // Iterate over each modulus/base pair.
        for (var modIdx = 0; modIdx < hashModuli.length; modIdx++) {
            // Initialize arrays for powers and hashes for the current modulus.
            powerValues[modIdx].length = prefixHashes[modIdx].length = currentStringLength + 1;
            powerValues[modIdx][0] = 1; // base^0 = 1
            prefixHashes[modIdx][0] = 0; // Hash of empty prefix is 0

            // Compute powers and prefix hashes.
            for (var charIdx = 0; charIdx < currentStringLength; charIdx++) {
                powerValues[modIdx][charIdx + 1] = modularMultiply(powerValues[modIdx][charIdx], hashBases[modIdx], hashModuli[modIdx]);
                prefixHashes[modIdx][charIdx + 1] = modularMultiply(prefixHashes[modIdx][charIdx], hashBases[modIdx], hashModuli[modIdx]) + inputStr.charCodeAt(charIdx);
                // Ensure hash stays within the modulus.
                if (prefixHashes[modIdx][charIdx + 1] >= hashModuli[modIdx]) {
                    prefixHashes[modIdx][charIdx + 1] -= hashModuli[modIdx];
                }
            }
        }
    }

    /**
     * Searches for the first occurrence of a substring within the hashed string.
     * @param {string} searchStr - The substring to search for.
     * @param {number} [startIndex=0] - The index to start the search from.
     * @returns {number} The starting index of the first match, or -1 if not found.
     */
    StringHasher.prototype.findSubstring = function(searchStr, startIndex) {
        var targetHashValues = calculateStringHash(searchStr); // Hash of the search string.
        var subStrLength = searchStr.length;
        var numModuli = hashModuli.length;
        var searchRange = currentStringLength - subStrLength + 1;
        var matchCount = 0; // Counter for matching hash components.

        // Iterate through all possible starting positions in the main string.
        for (var charIdx = startIndex || 0; charIdx < searchRange; charIdx++) {
            var currentHashValue = getRangeHash(charIdx, charIdx + subStrLength, 0); // Get hash for first modulus.
            if (currentHashValue === targetHashValues[0]) {
                matchCount = 1; // First hash component matches.
                // Check remaining hash components.
                for (var modIdx = 1; modIdx < numModuli; modIdx++) {
                    currentHashValue = getRangeHash(charIdx, charIdx + subStrLength, modIdx);
                    if (currentHashValue !== targetHashValues[modIdx]) {
                        break; // Mismatch, move to next starting position.
                    }
                    matchCount++;
                }
                // If all hash components match, we found it.
                if (matchCount === numModuli) {
                    return charIdx;
                }
            }
        }
        return -1; // Substring not found.
    };

    /**
     * Appends a string to the current hashed string and updates hashes.
     * @param {string} appendStr - The string to append.
     * @returns {number} The new total length of the hashed string.
     */
    StringHasher.prototype.appendString = function(appendStr) {
        var previousLength = currentStringLength;
        currentStringLength = this.size = currentStringLength + appendStr.length;

        // Update power values and prefix hashes for the appended part.
        for (var modIdx = 0; modIdx < hashModuli.length; modIdx++) {
            powerValues[modIdx].length = prefixHashes[modIdx].length = currentStringLength + 1;
            for (var charIdx = previousLength; charIdx < currentStringLength; charIdx++) {
                powerValues[modIdx][charIdx + 1] = modularMultiply(powerValues[modIdx][charIdx], hashBases[modIdx], hashModuli[modIdx]);
                prefixHashes[modIdx][charIdx + 1] = modularMultiply(prefixHashes[modIdx][charIdx], hashBases[modIdx], hashModuli[modIdx]) + appendStr.charCodeAt(charIdx - previousLength);
                if (prefixHashes[modIdx][charIdx + 1] >= hashModuli[modIdx]) {
                    prefixHashes[modIdx][charIdx + 1] -= hashModuli[modIdx];
                }
            }
        }
        return currentStringLength;
    };

    /**
     * Calculates the hash values for a given string.
     * @param {string} targetStr - The string for which to calculate hashes.
     * @returns {Array<number>} An array of hash values, one for each modulus.
     */
    function calculateStringHash(targetStr) {
        var hashResult = [];
        for (var modIdx = 0; modIdx < hashModuli.length; modIdx++) {
            var tempHash = 0;
            for (var charIdx = 0; charIdx < targetStr.length; charIdx++) {
                tempHash = modularMultiply(tempHash, hashBases[modIdx], hashModuli[modIdx]) + targetStr.charCodeAt(charIdx);
            }
            if (tempHash >= hashModuli[modIdx]) {
                tempHash -= hashModuli[modIdx];
            }
            hashResult.push(tempHash);
        }
        return hashResult;
    }

    /**
     * Gets the hash of a substring from the precomputed prefix hashes.
     * Formula: hash(s[leftBound...rightBound-1]) = (prefixHashes[rightBound] - prefixHashes[leftBound] * powerValues[modIndex][rightBound - leftBound]) % hashModuli[modIndex]
     * @param {number} leftBound - The starting index of the substring (inclusive).
     * @param {number} rightBound - The ending index of the substring (exclusive).
     * @param {number} modIndex - The index of the modulus/base pair to use.
     * @returns {number} The hash value of the substring.
     */
    function getRangeHash(leftBound, rightBound, modIndex) {
        var computedHash = prefixHashes[modIndex][rightBound] - modularMultiply(prefixHashes[modIndex][leftBound], powerValues[modIndex][rightBound - leftBound], hashModuli[modIndex]);
        if (computedHash < 0) {
            computedHash += hashModuli[modIndex];
        }
        return computedHash;
    }

    /**
     * Performs modular multiplication (a * b) % c efficiently.
     * This helps prevent overflow for large numbers before the modulo operation.
     * @param {number} factorA - First factor.
     * @param {number} factorB - Second factor.
     * @param {number} moduloC - Modulo value.
     * @returns {number} (factorA * factorB) % moduloC.
     */
    function modularMultiply(factorA, factorB, moduloC) {
        // Split factorA into two parts to handle potential overflow if factorA * factorB exceeds JS max safe integer.
        // (A * B) % C = ((A_high * 2^16) % C * B % C + (A_low) % C * B % C) % C
        return ((factorA >> 16) * factorB % moduloC * 65536 + (factorA & 65535) * factorB) % moduloC;
    }

    return createStringHasher;
})();

// Execute the main logic and print the result.
console.log(executeSolution());

/**
 * Main function containing the problem's logic.
 * Reads two strings, 's' and 't', and determines how many times 't' can be
 * formed by concatenating 's' and then repeatedly concatenating 't' itself,
 * such that the final string is a substring of the extended 's'.
 * @returns {number} The count of 't' concatenations, or -1 if infinite, or 0 if not found.
 */
function executeSolution() {
    var sourceString = inputData.readNextToken(true); // Read string 's'
    var patternString = inputData.readNextToken(true); // Read string 't'

    var extendedSource = sourceString;
    // Extend 's' until it's at least as long as 't'.
    while (extendedSource.length < patternString.length) {
        extendedSource += sourceString;
    }

    // Create a rolling hash for 's' concatenated with itself.
    // This allows searching for patterns that might wrap around the original 's'.
    var stringProcessor = StringHasher(extendedSource + extendedSource);

    // Find the first occurrence of 't' in the extended 's'.
    var firstMatchIndex = stringProcessor.findSubstring(patternString);

    // If 't' is not found at all, return 0.
    if (firstMatchIndex === -1) {
        return 0;
    }

    var growingPattern = patternString; // This will grow by concatenating 't'.
    var lastSuccessfulMatchIndex; // Stores the index of the last successful match.
    var resultCount = 0; // Counts how many times 't' can be concatenated.

    // Loop to find how many times 't' can be concatenated and still be found.
    while (firstMatchIndex >= 0) {
        growingPattern += patternString; // Append 't' to the growing pattern.
        lastSuccessfulMatchIndex = firstMatchIndex; // Store current match index.
        resultCount++; // Increment count.
        // Search for the new, longer pattern, starting from the previous match index.
        firstMatchIndex = stringProcessor.findSubstring(growingPattern, firstMatchIndex);
    }

    // After the loop, 'growingPattern' is one 't' longer than what was last found.
    // We need to check if appending 's' to the hashed string allows finding this
    // 'growingPattern' at the 'lastSuccessfulMatchIndex'.
    // If it does, it implies 't' can be concatenated infinitely.
    stringProcessor.appendString(extendedSource); // Append another 's' to the hashed string.

    // If the 'growingPattern' (which is one 't' longer than the last found)
    // can now be found starting at 'lastSuccessfulMatchIndex', it means
    // we can keep extending 's' and finding it, implying infinite concatenations.
    if (stringProcessor.findSubstring(growingPattern, lastSuccessfulMatchIndex) >= 0) {
        return -1; // Infinite concatenations possible.
    }

    // Otherwise, return the count of successful concatenations.
    return resultCount;
}
