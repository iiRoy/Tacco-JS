// A utility module for efficient input parsing from standard input.
// Renamed from GET to InputReader.
var InputReader = (function() {
    // Factory function to create a new reader instance.
    function createReader(sourceString) {
        return new LineProcessor(sourceString);
    }

    // LineProcessor class to handle splitting and extracting tokens from lines.
    function LineProcessor(rawInputString) {
        // Store lines after trimming whitespace and splitting by newline.
        this.sourceLines = rawInputString.trim().split("\n");
        // Pointer to the current line being processed.
        this.currentLineIndex = 0;
        // Cache for tokens of the current line, processed on demand.
        this.currentLineTokens = [];
    }

    // Helper to get tokens from the current line.
    LineProcessor.prototype._getTokensForCurrentLine = function() {
        // If we've run out of lines, return an empty array to prevent errors.
        if (this.currentLineIndex >= this.sourceLines.length) {
            return [];
        }

        // If tokens for the current line haven't been processed yet, do it.
        if (this.currentLineTokens.length === 0) {
            var lineContent = this.sourceLines[this.currentLineIndex];
            // Split by space and reverse to allow efficient `pop()` calls.
            // This approach avoids modifying the `sourceLines` array in place.
            this.currentLineTokens = lineContent.split(" ").reverse();
        }
        return this.currentLineTokens;
    };

    // Reads a single token from the current line. Moves to the next line if current is exhausted.
    // 'asString' flag determines if the token should be returned as a string or number.
    LineProcessor.prototype.readToken = function(asString) {
        var tokens = this._getTokensForCurrentLine();
        var extractedToken;

        // If no tokens left on the current line, attempt to advance to the next line.
        if (tokens.length === 0) {
            this.currentLineIndex++; // Advance to the next line
            tokens = this._getTokensForCurrentLine(); // Try to get tokens from the new line
            if (tokens.length === 0) { // If still no tokens, we're out of input
                 throw new Error("InputReader: Attempted to read token past end of input.");
            }
        }

        // Extract the last token from the reversed array.
        extractedToken = tokens.pop();

        // If the current line's tokens are now exhausted, clear the cache and mark for next line.
        if (tokens.length === 0) {
            this.currentLineIndex++;
            this.currentLineTokens = []; // Clear cache
        }

        // Return as string or convert to number based on the flag.
        return asString ? extractedToken : Number(extractedToken);
    };

    // Reads an entire line, splitting it into tokens.
    // 'asString' flag determines if tokens should be returned as strings or numbers.
    LineProcessor.prototype.readLineTokens = function(asString) {
        if (this.currentLineIndex >= this.sourceLines.length) {
            throw new Error("InputReader: Attempted to read line past end of input.");
        }

        // Get the current line, increment the index, and split it.
        var lineData = this.sourceLines[this.currentLineIndex++].split(" ");
        // Handle cases where an empty line results in `[""]` after splitting.
        if (lineData.length === 1 && lineData[0] === "") {
            lineData = [];
        }

        if (asString) {
            return lineData;
        } else {
            return lineData.map(val => Number(val));
        }
    };

    // Reads 'count' lines, each split into tokens, forming a 2D array (matrix).
    // 'asString' flag determines if tokens should be returned as strings or numbers.
    LineProcessor.prototype.readTokenMatrix = function(count, asString) {
        var matrixData = [];
        for (var i = 0; i < count; i++) {
            matrixData.push(this.readLineTokens(asString));
        }
        return matrixData;
    };

    // Reads 'count' lines without splitting, returning them as an array of raw strings or numbers.
    // 'asString' flag determines if lines should be returned as strings or numbers.
    LineProcessor.prototype.readRawLines = function(count, asString) {
        // Extract the requested number of lines.
        var rawLines = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + count);
        this.currentLineIndex += count; // Advance the line index.

        if (asString) {
            return rawLines;
        } else {
            // Assume each line contains a single number if numeric conversion is requested.
            return rawLines.map(line => Number(line));
        }
    };

    return createReader;
})();

// Initialize the input processor with content from standard input.
var inputProcessor = InputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array initialized with a specific value.
 * This is a recursive implementation to avoid `eval`.
 * Renamed from `xArray` to `createMultiDimensionalArray`.
 * @param {Array<number>} dimensions An array specifying the size of each dimension.
 * @param {*} fillValue The value to initialize all elements with.
 * @returns {Array} The multi-dimensional array.
 */
function createMultiDimensionalArray(dimensions, fillValue) {
    // Input validation for dimensions.
    if (!Array.isArray(dimensions) || dimensions.some(d => typeof d !== 'number' || d < 0 || !Number.isInteger(d))) {
        throw new Error("createMultiDimensionalArray: Dimensions must be an array of non-negative integers.");
    }
    if (dimensions.length === 0) {
        return fillValue; // Base case for 0 dimensions, return the value itself.
    }

    const currentDimSize = dimensions[0];
    const remainingDims = dimensions.slice(1);
    const newArray = [];

    // Recursively build the array for each element in the current dimension.
    for (let i = 0; i < currentDimSize; i++) {
        newArray.push(createMultiDimensionalArray(remainingDims, fillValue));
    }

    return newArray;
}


// Disjoint Set Union (Union-Find) data structure.
// Renamed from UnionFind to DisjointSet.
var DisjointSet = (function() {
    // Factory function, though typically 'new DisjointSet(n)' is used directly.
    function createDisjointSet(elementCount) {
        return new DisjointSet(elementCount);
    }

    // Constructor for the DisjointSet.
    // Initializes 'elementCount' sets, each containing a single element.
    function DisjointSet(elementCount) {
        // `parentSizeArray` stores parent pointers and set sizes.
        // If `parentSizeArray[i]` < 0, `i` is a root, and its value is -size.
        // If `parentSizeArray[i]` >= 0, `i` is not a root, and its value is its parent's index.
        // BUG FIX: The original code declared 'a' as a var in the IIFE scope, making it shared
        // across all instances. This version correctly makes it an instance property.
        this.parentSizeArray = Array(elementCount + 1).fill(-1);
        this.numComponents = elementCount; // Keep track of the number of disjoint sets.
    }

    // Finds the representative (root) of the set containing element 'index'.
    // Implements path compression for efficiency.
    DisjointSet.prototype.findSetRepresentative = function(index) {
        // If `index` is a root (value is negative), return itself.
        if (this.parentSizeArray[index] < 0) {
            return index;
        }
        // Otherwise, recursively find the root and compress the path.
        // The parent of 'index' is updated directly to the root.
        return this.parentSizeArray[index] = this.findSetRepresentative(this.parentSizeArray[index]);
    };

    // Checks if two elements 'elementX' and 'elementY' belong to the same set.
    DisjointSet.prototype.areConnected = function(elementX, elementY) {
        return this.findSetRepresentative(elementX) === this.findSetRepresentative(elementY);
    };

    // Merges the sets containing 'elementX' and 'elementY'.
    // Returns `true` if a merge occurred, `false` if they were already in the same set.
    // Implements union by size optimization.
    DisjointSet.prototype.unionSets = function(elementX, elementY) {
        // Find the representatives of the sets.
        let rootX = this.findSetRepresentative(elementX);
        let rootY = this.findSetRepresentative(elementY);

        // If they are already in the same set, no merge needed.
        if (rootX === rootY) {
            return false;
        }

        // Union by size: attach the smaller tree under the root of the larger tree.
        // The size is stored as a negative value at the root.
        // If `parentSizeArray[rootX]` is less than `parentSizeArray[rootY]`,
        // it means rootX's set is larger (more negative value).
        if (this.parentSizeArray[rootX] < this.parentSizeArray[rootY]) {
            // Add size of rootY's set to rootX's set.
            this.parentSizeArray[rootX] += this.parentSizeArray[rootY];
            // Make rootX the parent of rootY.
            this.parentSizeArray[rootY] = rootX;
        } else { // rootY's set is larger or equal in size.
            // Add size of rootX's set to rootY's set.
            this.parentSizeArray[rootY] += this.parentSizeArray[rootX];
            // Make rootY the parent of rootX.
            this.parentSizeArray[rootX] = rootY;
        }
        this.numComponents--; // One less component after a successful union.
        return true;
    };

    // Returns the size of the set containing 'index'.
    DisjointSet.prototype.getComponentSize = function(index) {
        // The size is stored as the negative value of the root.
        return -this.parentSizeArray[this.findSetRepresentative(index)];
    };

    // Returns the total number of disjoint sets currently in the structure.
    DisjointSet.prototype.getSetCount = function() {
        return this.numComponents;
    };

    return createDisjointSet;
})();


// Rolling Hash (String Hashing) data structure for efficient substring comparisons.
// Renamed from RollingHash to StringHasher.
var StringHasher = (function() {
    // Fixed parameters for hashing. These are global constants within the closure,
    // ensuring consistency across all StringHasher instances for the same problem.
    const HASH_BASE = 1007; // A prime base for polynomial hashing.
    const PRIME_MODULI = [94906249, 94906247]; // Two large prime moduli to reduce collision probability.

    // Static method to compute the hash of a literal string.
    // This is useful for getting the hash of a pattern string before using it with an instance.
    function computeLiteralHash(targetString) {
        const resultHashes = [];
        for (let j = 0; j < PRIME_MODULI.length; j++) {
            let currentHashValue = 0;
            const currentMod = PRIME_MODULI[j];
            for (let i = 0; i < targetString.length; i++) {
                currentHashValue = (currentHashValue * HASH_BASE + targetString.charCodeAt(i)) % currentMod;
            }
            resultHashes.push(currentHashValue);
        }
        return resultHashes;
    }

    // Factory function for StringHasher.
    function createStringHasher(initialString) {
        return new StringHasher(initialString);
    }

    // Constructor for StringHasher.
    // Precomputes prefix hashes and power values for a given string.
    function StringHasher(initialString) {
        // BUG FIX: The original code declared `pow`, `hash`, `size` as vars in the IIFE scope,
        // making them shared across all instances. This version correctly makes them instance properties.
        this.currentStringLength = initialString.length;
        // `powerTable[j][k]` stores (HASH_BASE^k) % PRIME_MODULI[j].
        this.powerTable = Array(PRIME_MODULI.length).fill(null).map(() => [1]);
        // `prefixHashes[j][k]` stores the hash of `initialString[0...k-1]` using PRIME_MODULI[j].
        this.prefixHashes = Array(PRIME_MODULI.length).fill(null).map(() => [0]);

        // Precompute powers and prefix hashes for each modulus.
        for (let j = 0; j < PRIME_MODULI.length; j++) {
            const currentMod = PRIME_MODULI[j];
            // Ensure arrays are sized correctly for the current string length + 1 (for 0-th index).
            this.powerTable[j].length = this.currentStringLength + 1;
            this.prefixHashes[j].length = this.currentStringLength + 1;

            for (let i = 0; i < this.currentStringLength; i++) {
                // Calculate (base^i) % mod.
                this.powerTable[j][i + 1] = (this.powerTable[j][i] * HASH_BASE) % currentMod;
                // Calculate hash of prefix s[0...i].
                this.prefixHashes[j][i + 1] = (this.prefixHashes[j][i] * HASH_BASE + initialString.charCodeAt(i)) % currentMod;
            }
        }
    }

    // Private helper function (closure) to get the hash of a substring.
    // This is an internal utility and not exposed on the prototype.
    // `leftIndex` (inclusive), `rightIndex` (exclusive), `modIndex` (which prime modulus to use).
    function _getSubstringHash(hasherInstance, leftIndex, rightIndex, modIndex) {
        const currentMod = PRIME_MODULI[modIndex];
        // Hash of s[left...right-1] = (hash[right] - hash[left] * pow[right-left]) % mod.
        let subHash = (hasherInstance.prefixHashes[modIndex][rightIndex] -
                       hasherInstance.prefixHashes[modIndex][leftIndex] *
                       hasherInstance.powerTable[modIndex][rightIndex - leftIndex]);

        // Ensure the result is positive by adding the modulus if it's negative.
        subHash %= currentMod;
        if (subHash < 0) {
            subHash += currentMod;
        }
        return subHash;
    }

    // Finds the first occurrence of a pattern string 'pattern' in the hashed string,
    // starting from index 'startIndex'. Returns the starting index or -1 if not found.
    StringHasher.prototype.findSubstring = function(pattern, startIndex) {
        const patternHash = computeLiteralHash(pattern);
        const patternLength = pattern.length;
        const numMods = PRIME_MODULI.length;
        // The maximum starting index for a match.
        const searchLimit = this.currentStringLength - patternLength + 1;

        // Iterate through all possible starting positions in the hashed string.
        for (let i = startIndex; i < searchLimit; i++) {
            // First, quickly check against the first modulus. If it matches, proceed to others.
            if (_getSubstringHash(this, i, i + patternLength, 0) === patternHash[0]) {
                let allModsMatch = true;
                // Check against all other moduli to minimize collision probability.
                for (let j = 1; j < numMods; j++) {
                    if (_getSubstringHash(this, i, i + patternLength, j) !== patternHash[j]) {
                        allModsMatch = false;
                        break; // Mismatch found, move to next starting position.
                    }
                }
                if (allModsMatch) {
                    return i; // All moduli matched, pattern found with high probability.
                }
            }
        }
        return -1; // Pattern not found.
    };

    // Compares the hash of a given pattern (precomputed `patternHash`)
    // with a substring of length `patternLength` starting at `startIndex` in the hashed string.
    // Returns 1 if hashes match for all moduli, 0 otherwise.
    StringHasher.prototype.compareSubstrings = function(patternHash, patternLength, startIndex) {
        const numMods = PRIME_MODULI.length;
        // Iterate through all prime moduli.
        for (let j = 0; j < numMods; j++) {
            const currentSubHash = _getSubstringHash(this, startIndex, startIndex + patternLength, j);
            // If any modulus hash does not match, return 0 (false).
            if (currentSubHash !== patternHash[j]) {
                return 0;
            }
        }
        return 1; // All hashes matched, indicating a high probability of a true match.
    };

    // Appends a new string `newSegment` to the end of the current string and updates hashes.
    // Returns the new total length of the string.
    StringHasher.prototype.appendString = function(newSegment) {
        const oldLength = this.currentStringLength;
        // Update the total string length.
        this.currentStringLength += newSegment.length;

        // Resize hash and power tables for the new length.
        for (let j = 0; j < PRIME_MODULI.length; j++) {
            const currentMod = PRIME_MODULI[j];
            this.powerTable[j].length = this.currentStringLength + 1;
            this.prefixHashes[j].length = this.currentStringLength + 1;

            // Compute hashes for the new segment, extending from the old length.
            for (let i = oldLength; i < this.currentStringLength; i++) {
                const charCode = newSegment.charCodeAt(i - oldLength);
                this.powerTable[j][i + 1] = (this.powerTable[j][i] * HASH_BASE) % currentMod;
                this.prefixHashes[j][i + 1] = (this.prefixHashes[j][i] * HASH_BASE + charCode) % currentMod;
            }
        }
        return this.currentStringLength;
    };

    // Expose the static method for external use.
    createStringHasher.computeLiteralHash = computeLiteralHash;

    return createStringHasher;
})();

// Execute the main problem-solving logic and print the result.
console.log(solveProblem());

/**
 * Main function to solve the problem.
 * This problem likely involves finding the maximum number of connected occurrences
 * of a pattern string 'targetPattern' within a main string 'mainString',
 * considering circular shifts.
 * Renamed from `main` to `solveProblem`.
 * @returns {number} The calculated result based on the problem logic.
 */
function solveProblem() {
    // Read the main string and the target pattern from input.
    const mainString = inputProcessor.readToken(true);
    const targetPattern = inputProcessor.readToken(true);

    const mainLen = mainString.length;
    const targetLen = targetPattern.length;

    // Early exit conditions for invalid input or impossible scenarios.
    if (targetLen === 0) {
        return 0; // An empty pattern cannot form connections.
    }
    if (mainLen === 0) {
        return -1; // Cannot find anything in an empty main string.
    }
    if (targetLen > mainLen) {
        // If the target pattern is longer than the main string, it cannot occur.
        // Returning 0 or -1 depends on exact problem specification; 0 implies no matches.
        return 0;
    }

    // Create an extended version of the main string (s+s+...) to handle circular matches.
    // It needs to be long enough to check a pattern starting at `mainLen-1` and extending `targetLen` characters.
    // So, it needs to be at least `(mainLen - 1) + targetLen` characters long.
    let extendedMainString = mainString.repeat(2);
    while (extendedMainString.length < mainLen + targetLen - 1) {
        extendedMainString += mainString; // Append more copies if necessary (rare for typical constraints).
    }

    // Initialize Disjoint Set Union data structure for `mainLen` elements.
    // Each element (index) represents a potential starting position in the main string.
    const disjointSets = DisjointSet(mainLen);

    // Initialize String Hasher with the extended main string.
    const stringHasher = StringHasher(extendedMainString);

    // Precompute hash for the target pattern once.
    const patternHash = StringHasher.computeLiteralHash(targetPattern);

    // Iterate through all possible starting positions in the original main string (0 to mainLen-1).
    for (let i = 0; i < mainLen; i++) {
        // Check if the target pattern matches the substring starting at `i`
        // in the extended main string using rolling hash.
        if (stringHasher.compareSubstrings(patternHash, targetLen, i)) {
            // If a match is found, unite the current position `i`
            // with the position where the pattern would logically continue circularly.
            // `(i + targetLen) % mainLen` handles the circular wrap-around.
            // If `unionSets` returns `false`, it means `i` and `(i+targetLen)%mainLen`
            // were already connected. In the context of this problem, this might
            // indicate an invalid state or a specific problem constraint,
            // leading to an early exit with -1.
            if (!disjointSets.unionSets(i, (i + targetLen) % mainLen)) {
                return -1;
            }
        }
    }

    // After processing all possible matches and forming connections,
    // find the maximum size among all connected components.
    let maxComponentSize = 0;
    // Iterate through each element (potential starting position) to find its component size.
    for (let i = 0; i < mainLen; i++) {
        const currentComponentSize = disjointSets.getComponentSize(i);
        if (maxComponentSize < currentComponentSize) {
            maxComponentSize = currentComponentSize;
        }
    }

    // The problem output typically requires `maxComponentSize - 1` for this specific problem type.
    return maxComponentSize - 1;
}