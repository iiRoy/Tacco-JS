// Utility for reading input data from standard input
var DATA_READER = (function() {
  /**
   * Factory function to create a new DataReader instance.
   * @param {string} inputString - The raw string content read from input.
   * @returns {DataReader} A new DataReader object.
   */
  function createDataReader(inputString) {
    return new DataReader(inputString);
  }

  /**
   * DataReader constructor.
   * Initializes the reader with input lines and a pointer.
   * @param {string} inputString - The raw input string, typically from stdin.
   */
  function DataReader(inputString) {
    this._lines = inputString.trim().split("\n"); // Split input into an array of lines
    this._currentLineIndex = 0; // Pointer to the current line being processed
  }

  /**
   * Reads the next value from the current line. Values are consumed from right to left
   * (effectively, the first value on the line is read first due to internal reversal).
   * @param {boolean} asString - If true, returns the value as a string; otherwise, attempts to convert to a number.
   * @returns {string|number} The next value from the input.
   */
  DataReader.prototype.readNextValue = function(asString) {
    var linesArray = this._lines;
    var lineIdx = this._currentLineIndex;
    var resultValue;

    // If the current line hasn't been tokenized yet, split it by spaces and reverse for efficient popping.
    if (typeof linesArray[lineIdx] === "string") {
      linesArray[lineIdx] = linesArray[lineIdx].split(" ").reverse();
    }

    resultValue = linesArray[lineIdx].pop(); // Get the last element (which was originally the first)

    // If the current line is now empty, advance the line pointer.
    if (!linesArray[lineIdx].length) {
      this._currentLineIndex++;
    }

    return asString ? resultValue : +resultValue; // Return as string or number
  };

  /**
   * Reads an entire line, splitting it into parts.
   * @param {boolean} asStrings - If true, returns an array of strings; otherwise, an array of numbers.
   * @returns {Array<string|number>} An array containing the values from the line.
   */
  DataReader.prototype.readNextLine = function(asStrings) {
    var currentLineParts = this._lines[this._currentLineIndex++].split(" ");
    return asStrings ? currentLineParts : currentLineParts.map(numStr => +numStr);
  };

  /**
   * Reads a specified number of lines, treating each as a row in a matrix.
   * @param {number} numLines - The count of lines to read.
   * @param {boolean} asStringsMatrix - If true, returns a 2D array of strings; otherwise, numbers.
   * @returns {Array<Array<string|number>>} A matrix (2D array) of values.
   */
  DataReader.prototype.readMultipleLines = function(numLines, asStringsMatrix) {
    var lineMatrix = this._lines.slice(this._currentLineIndex, this._currentLineIndex += numLines).map(line => line.split(" "));
    return asStringsMatrix ? lineMatrix : lineMatrix.map(lineParts => lineParts.map(numStr => +numStr));
  };

  /**
   * Reads a specified number of lines as raw string or number values.
   * @param {number} count - The number of lines to read.
   * @param {boolean} asRawStrings - If true, returns an array of raw strings; otherwise, numbers.
   * @returns {Array<string|number>} An array of raw line values.
   */
  DataReader.prototype.readRawLines = function(count, asRawStrings) {
    var rawLines = this._lines.slice(this._currentLineIndex, this._currentLineIndex += count);
    return asRawStrings ? rawLines : rawLines.map(val => +val);
  };

  return createDataReader;
})();

// Initialize the input processor by reading from standard input
var inputProcessor = DATA_READER(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array initialized with a given value.
 * This function uses `eval` to dynamically construct the array creation string.
 * @param {*} initialValue - The value to fill the array elements with.
 * @param {...number} dimensions - The dimensions of the array (e.g., `createMultiDimArray(0, 3, 4)` for a 3x4 array).
 * @returns {Array} The created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  var args = arguments,
    len = args.length,
    arrayCreationString = "Array(args[" + --len + "]).fill(0).map(x=>{return " + initialValue + ";})";
  while (--len) {
    arrayCreationString = "Array(args[" + len + "]).fill(0).map(x=>" + arrayCreationString + ")";
  }
  return eval(arrayCreationString); // Execute the dynamically constructed string
}

// Disjoint Set Union (Union-Find) data structure implementation
var DisjointSet = (function() {
  var _parentElements; // This closure variable stores parent pointers and set sizes (negative for roots).
  // It's shared across all instances created by this IIFE, meaning only one DisjointSet can be used effectively at a time.

  /**
   * Factory function to create a DisjointSet instance.
   * @param {number} elementCount - The total number of elements in the set.
   * @returns {DisjointSet} A new DisjointSet object.
   */
  function createDisjointSet(elementCount) {
    return new DisjointSet(elementCount);
  }

  /**
   * DisjointSet constructor.
   * @param {number} elementCount - The number of elements to manage.
   */
  function DisjointSet(elementCount) {
    // Initialize parent array: -1 indicates a root, and its absolute value is the size of the set.
    _parentElements = this._parentElements = Array(elementCount + 1).fill(-1);
  }

  /**
   * Finds the root (representative) of the set containing the given element.
   * Implements path compression for efficiency.
   * @param {number} elementIndex - The index of the element.
   * @returns {number} The root of the set containing `elementIndex`.
   */
  DisjointSet.prototype.findRoot = function(elementIndex) {
    if (_parentElements[elementIndex] < 0) return elementIndex; // If negative, it's a root
    // Path compression: set parent to root directly
    return _parentElements[elementIndex] = this.findRoot(_parentElements[elementIndex]);
  };

  /**
   * Checks if two elements belong to the same set.
   * @param {number} elementX - The first element.
   * @param {number} elementY - The second element.
   * @returns {boolean} True if `elementX` and `elementY` are in the same set, false otherwise.
   */
  DisjointSet.prototype.areConnected = function(elementX, elementY) {
    return this.findRoot(elementX) === this.findRoot(elementY);
  };

  /**
   * Unites the sets containing `elementX` and `elementY`.
   * Implements union by size (attaching smaller tree to larger tree's root).
   * @param {number} elementX - The first element.
   * @param {number} elementY - The second element.
   * @returns {boolean} True if the sets were successfully united (i.e., they were different), false if they were already in the same set.
   */
  DisjointSet.prototype.unionSets = function(elementX, elementY) {
    elementX = this.findRoot(elementX);
    elementY = this.findRoot(elementY);

    if (elementX === elementY) return false; // Already in the same set

    // Union by size: attach the smaller tree to the root of the larger tree.
    // The element with the smaller index is arbitrarily chosen as the "larger" root if sizes are equal.
    if (elementX < elementY) {
      _parentElements[elementX] += _parentElements[elementY]; // Update size of the new root
      _parentElements[elementY] = elementX; // Make elementX the parent of elementY's root
    } else {
      _parentElements[elementY] += _parentElements[elementX]; // Update size of the new root
      _parentElements[elementX] = elementY; // Make elementY the parent of elementX's root
    }
    return true;
  };

  /**
   * Gets the size of the set containing the given element.
   * @param {number} elementIndex - The element whose set size is requested.
   * @returns {number} The number of elements in the set.
   */
  DisjointSet.prototype.getSetSize = function(elementIndex) {
    return -_parentElements[this.findRoot(elementIndex)]; // Size is stored as negative at the root
  };

  return createDisjointSet;
})();

// Rolling Hash implementation for efficient substring searching
var StringHasher = (function() {
  var hashBase = 1007; // Base for polynomial hashing (a prime number)
  var hashMods = [94906249, 94906247]; // Two distinct large prime moduli to reduce collision probability
  var powerTable = [
    [1],
    [1]
  ]; // Stores precomputed powers of hashBase modulo each hashMod
  var prefixHashes = [
    [0],
    [0]
  ]; // Stores precomputed prefix hashes for each hashMod
  var currentStringLength; // The length of the string currently hashed by this module.
  // These variables are shared across all StringHasher instances due to the IIFE closure.

  /**
   * Factory function to create a StringHasher instance.
   * @param {string} inputString - The string to be hashed.
   * @returns {StringHasher} A new StringHasher object.
   */
  function createStringHasher(inputString) {
    return new StringHasher(inputString);
  }

  /**
   * StringHasher constructor.
   * Precomputes prefix hashes and powers for the given string.
   * @param {string} inputString - The string for which to compute hashes.
   */
  function StringHasher(inputString) {
    currentStringLength = this.currentStringLength = inputString.length;
    for (var modIndex = 0; modIndex < hashMods.length; modIndex++) {
      // Ensure arrays are sized correctly for current string length
      powerTable[modIndex].length = prefixHashes[modIndex].length = currentStringLength + 1;
      for (var charIndex = 0; charIndex < currentStringLength; charIndex++) {
        // Calculate powers of base
        powerTable[modIndex][charIndex + 1] = (powerTable[modIndex][charIndex] * hashBase) % hashMods[modIndex];
        // Calculate prefix hashes
        prefixHashes[modIndex][charIndex + 1] = (prefixHashes[modIndex][charIndex] * hashBase + inputString.charCodeAt(charIndex)) % hashMods[modIndex];
      }
    }
  }

  /**
   * Finds the first occurrence of a target substring in the hashed string, starting from a given index.
   * @param {string} targetSubstring - The substring to search for.
   * @param {number} startIndex - The index in the main string to begin the search.
   * @returns {number} The starting index of the first match, or -1 if the substring is not found.
   */
  StringHasher.prototype.findSubstring = function(targetSubstring, startIndex) {
    var targetHash = calculateStringHash(targetSubstring); // Get hash of the target substring
    var subLength = targetSubstring.length;
    var numMods = hashMods.length;
    var searchRange = currentStringLength - subLength + 1;

    for (var i = startIndex; i < searchRange; i++) {
      // First, check with the first modulus
      if (getRangeHash(i, i + subLength, 0) === targetHash[0]) {
        var allMatch = 1;
        // If the first matches, check with all other moduli
        for (var modIndex = 1; modIndex < numMods; modIndex++) {
          if (getRangeHash(i, i + subLength, modIndex) !== targetHash[modIndex]) break; // Mismatch, break
          allMatch++;
        }
        if (allMatch === numMods) return i; // All hashes matched, found it!
      }
    }
    return -1; // Substring not found
  };

  /**
   * Checks if the hash of a substring at a given position matches a precomputed hash array.
   * @param {Array<number>} subHash - The precomputed hash values of the substring to compare against.
   * @param {number} subLen - The length of the substring.
   * @param {number} position - The starting position in the main string to check.
   * @returns {number} 1 if all hash values match, 0 otherwise.
   */
  StringHasher.prototype.checkHashMatch = function(subHash, subLen, position) {
    for (var modIndex = 0; modIndex < hashMods.length; modIndex++) {
      if (getRangeHash(position, position + subLen, modIndex) !== subHash[modIndex]) return 0;
    }
    return 1; // All hash components matched
  };

  /**
   * Appends a string to the current hashed string and updates the hash tables.
   * This operation modifies the shared `powerTable` and `prefixHashes`.
   * @param {string} stringToAdd - The string to append.
   * @returns {number} The new total length of the hashed string.
   */
  StringHasher.prototype.appendString = function(stringToAdd) {
    var previousLength = currentStringLength;
    currentStringLength = this.currentStringLength = currentStringLength + stringToAdd.length;

    for (var modIndex = 0; modIndex < hashMods.length; modIndex++) {
      // Resize arrays to accommodate the new length
      powerTable[modIndex].length = prefixHashes[modIndex].length = currentStringLength + 1;
      for (var charIndex = previousLength; charIndex < currentStringLength; charIndex++) {
        // Continue calculating powers and prefix hashes from the previous end
        powerTable[modIndex][charIndex + 1] = (powerTable[modIndex][charIndex] * hashBase) % hashMods[modIndex];
        prefixHashes[modIndex][charIndex + 1] = (prefixHashes[modIndex][charIndex] * hashBase + stringToAdd.charCodeAt(charIndex - previousLength)) % hashMods[modIndex];
      }
    }
    return currentStringLength;
  };

  /**
   * Calculates the rolling hash for a given string (not necessarily the one stored in the hasher).
   * This is a static-like helper function.
   * @param {string} inputStr - The string for which to calculate the hash.
   * @returns {Array<number>} An array of hash values, one for each modulus.
   */
  function calculateStringHash(inputStr) {
    var hashValues = [];
    for (var modIndex = 0; modIndex < hashMods.length; modIndex++) {
      var currentHashVal = 0;
      for (var charIndex = 0; charIndex < inputStr.length; charIndex++) {
        currentHashVal = (currentHashVal * hashBase + inputStr.charCodeAt(charIndex)) % hashMods[modIndex];
      }
      hashValues.push(currentHashVal);
    }
    return hashValues;
  }

  /**
   * Retrieves the hash of a substring from the precomputed prefix hashes.
   * Uses the formula: hash(L, R) = (prefixHashes[R] - prefixHashes[L] * powerTable[R-L]) % mod.
   * Handles negative results from modulo operation.
   * @param {number} leftBound - The starting index of the substring (inclusive).
   * @param {number} rightBound - The ending index of the substring (exclusive).
   * @param {number} modIdx - The index of the modulus to use (0 or 1).
   * @returns {number} The hash value of the substring.
   */
  function getRangeHash(leftBound, rightBound, modIdx) {
    var calculatedHash = (prefixHashes[modIdx][rightBound] - prefixHashes[modIdx][leftBound] * powerTable[modIdx][rightBound - leftBound]) % hashMods[modIdx];
    return calculatedHash < 0 ? calculatedHash + hashMods[modIdx] : calculatedHash;
  }

  createStringHasher.calculateStringHash = calculateStringHash; // Expose the static helper function
  return createStringHasher;
})();

// Output the result of the main processing function to console
console.log(processInput());

/**
 * Main processing logic for the problem.
 * This function determines the maximum number of non-overlapping occurrences of string T in string S,
 * considering that S can be wrapped around (circularly).
 * @returns {number} The maximum count of non-overlapping T's, or -1 if a valid placement is impossible.
 */
function processInput() {
  var inputStr = inputProcessor.readNextValue(true); // Read string S
  var targetStr = inputProcessor.readNextValue(true); // Read string T

  var inputStrLen = inputStr.length;
  var targetStrLen = targetStr.length;

  // Create a doubled string (S+S) to easily handle circular matches.
  // Extend it further if necessary to ensure it's long enough for any T placement.
  var doubledStr = inputStr + inputStr;
  while (doubledStr.length < inputStrLen + targetStrLen) {
    doubledStr += inputStr;
  }

  var disjointSetInstance = DisjointSet(inputStrLen); // Initialize DSU for `inputStrLen` elements
  var stringHasherInstance = StringHasher(doubledStr); // Initialize Rolling Hash for the extended string
  var targetStrHash = StringHasher.calculateStringHash(targetStr); // Precompute hash for `targetStr`

  // Iterate through all possible starting positions of `targetStr` within `inputStr` (0 to `inputStrLen - 1`).
  for (var loopIndex = 0; loopIndex < inputStrLen; loopIndex++) {
    // Check if `targetStr` matches the substring of `doubledStr` starting at `loopIndex`.
    if (stringHasherInstance.checkHashMatch(targetStrHash, targetStrLen, loopIndex)) {
      // If a match is found, unite the current position `loopIndex` with the position
      // that would immediately follow this occurrence of `targetStr` in a circular fashion.
      // The modulo `inputStrLen` handles the wrap-around.
      // If `unionSets` returns false, it means `loopIndex` and `(loopIndex + targetStrLen) % inputStrLen`
      // are already in the same set. This implies a conflict or an impossible arrangement.
      if (!disjointSetInstance.unionSets(loopIndex, (loopIndex + targetStrLen) % inputStrLen)) {
        return -1; // Indicates an invalid configuration (e.g., overlapping T's forming a cycle)
      }
    }
  }

  var resultCount = 1; // Initialize with 1, as at least one T can be placed if no -1 was returned.
  // After processing all possible placements, find the largest connected component in the Disjoint Set.
  // The size of the largest component represents the maximum number of non-overlapping `targetStr`s
  // that can be placed in a chain.
  for (loopIndex = 0; loopIndex < inputStrLen; loopIndex++) {
    var currentSetSize = disjointSetInstance.getSetSize(loopIndex);
    if (resultCount < currentSetSize) {
      resultCount = currentSetSize;
    }
  }

  // The problem's specific interpretation requires returning `resultCount - 1`.
  // This often happens when `resultCount` represents nodes in a path/cycle and the answer is segments/edges.
  return resultCount - 1;
}
