/* This module provides utility functions for parsing input data,
   typically from standard input or a file. */
var INPUT_PARSER=(function(){
  /**
   * Factory function to create a new input parser instance.
   * @param {string} inputSource The raw string data to parse.
   * @returns {StringDataParser} A new parser object.
   */
  function createParser(inputSource){
    return new StringDataParser(inputSource);
  }

  /**
   * Constructor for the StringDataParser.
   * It preprocesses the input string into an array of lines.
   * @param {string} rawStringData The unprocessed string input.
   */
  function StringDataParser(rawStringData){
    this._linesArray = rawStringData.trim().split("\n");
    this._currentLineIndex = 0; // Tracks the current line being processed.
  }

  /* Methods for StringDataParser prototype */

  /**
   * Retrieves the next 'atom' (word or number) from the current line.
   * If the current line is exhausted, it moves to the next line.
   * @param {boolean} returnAsString If true, returns the atom as a string; otherwise, attempts to convert to a number.
   * @returns {string|number} The parsed atom.
   */
  StringDataParser.prototype.nextAtom=function(returnAsString){
    var currentLines=this._linesArray,
        lineIndex=this._currentLineIndex,
        resultValue;
    // If the current line hasn't been split into words yet, do it.
    if(typeof currentLines[lineIndex]==="string") currentLines[lineIndex]=currentLines[lineIndex].split(" ").reverse();
    // Pop the last element (which is the first word due to reverse).
    resultValue=currentLines[lineIndex].pop();
    // If the line is now empty, advance to the next line.
    if(!currentLines[lineIndex].length) this._currentLineIndex++;
    return returnAsString?resultValue:+resultValue;
  };

  /**
   * Retrieves all elements from the current line and advances to the next line.
   * @param {boolean} getRawElements If true, returns elements as strings; otherwise, attempts to convert to numbers.
   * @returns {string[]|number[]} An array of elements from the line.
   */
  StringDataParser.prototype.nextLine=function(getRawElements){
    var lineParts=this._linesArray[this._currentLineIndex++].split(" ");
    return getRawElements?lineParts:lineParts.map(item=>+item);
  };

  /**
   * Retrieves a matrix of data (multiple lines, multiple columns) and advances the line index.
   * @param {number} numRows The number of rows (lines) to read for the matrix.
   * @param {boolean} getRawElements If true, returns elements as strings; otherwise, attempts to convert to numbers.
   * @returns {string[][]|number[][]} A 2D array representing the matrix.
   */
  StringDataParser.prototype.nextMatrix=function(numRows,getRawElements){
    var matrixResult=this._linesArray.slice(this._currentLineIndex,this._currentLineIndex+=numRows).map(line=>line.split(" "));
    return getRawElements?matrixResult:matrixResult.map(row=>row.map(element=>+element));
  };

  /**
   * Retrieves a range of lines as a 1D array and advances the line index.
   * @param {number} count The number of lines to read.
   * @param {boolean} getRawElements If true, returns lines as strings; otherwise, attempts to convert to numbers.
   * @returns {string[]|number[]} An array of lines.
   */
  StringDataParser.prototype.nextRange=function(count,getRawElements){
    var rangeResult=this._linesArray.slice(this._currentLineIndex,this._currentLineIndex+=count);
    return getRawElements?rangeResult:rangeResult.map(item=>+item);
  };
  return createParser;
})();

// Initialize an input reader instance
var inputReader=INPUT_PARSER(require("fs").readFileSync("/dev/stdin","utf8"));

/**
 * Creates a multi-dimensional array initialized with a specific value.
 * @param {*} initialValue The value to initialize array elements with.
 * @param {...number} dimensions Variable number of arguments representing array dimensions.
 * @returns {Array} The initialized multi-dimensional array.
 */
function multiDimArray(initialValue){
  var argumentsList=arguments,
      lengthCounter=argumentsList.length,
      arrayCreationCode="Array(argumentsList["+ --lengthCounter+"]).fill(0).map(x=>{return "+initialValue+";})";
  while(--lengthCounter) arrayCreationCode="Array(argumentsList["+lengthCounter+"]).fill(0).map(x=>"+arrayCreationCode+")";
  return eval(arrayCreationCode); // Evaluate the dynamically constructed array creation string.
}

/*
 * This module implements a Double Hashing (Rolling Hash) algorithm
 * for efficient substring search and comparison.
 * It uses two different prime bases and moduli to minimize collision probability.
 */
var DoubleHasher=(function(){
  // Two distinct prime bases for hashing
  var hashBases = [1009, 1007];
  // Two distinct large prime moduli
  var primeModuli = [1e9 + 7, 1e9 + 9];
  // Stores powers of bases modulo respective primes for efficient hash calculation
  var powerValues = [[], []];
  // Stores prefix hashes for the string being processed
  var prefixHashes = [[], []];
  // Current length of the string managed by the hasher
  var currentStringLength;

  /**
   * Factory function to create a new DoubleHasher instance.
   * @param {string} targetSequence The string to initialize the hasher with.
   * @returns {DoubleHasher} A new DoubleHasher object.
   */
  function createDoubleHasher(targetSequence){
    return new DoubleHasher(targetSequence);
  }

  /**
   * Constructor for the DoubleHasher.
   * Precomputes prefix hashes and powers for the given string.
   * @param {string} initialSequence The string to hash.
   */
  function DoubleHasher(initialSequence){
    currentStringLength = this.sequenceLength = initialSequence.length;
    // Iterate over each modulus/base pair
    for(var modulusIndex = 0; modulusIndex < primeModuli.length; modulusIndex++){
      powerValues[modulusIndex].length = prefixHashes[modulusIndex].length = currentStringLength + 1;
      powerValues[modulusIndex][0] = 1;
      prefixHashes[modulusIndex][0] = 0;
      // Calculate powers and prefix hashes
      for(var charIndex = 0; charIndex < currentStringLength; charIndex++){
        powerValues[modulusIndex][charIndex+1] = multiplyModulo(powerValues[modulusIndex][charIndex], hashBases[modulusIndex], primeModuli[modulusIndex]);
        prefixHashes[modulusIndex][charIndex+1] = multiplyModulo(prefixHashes[modulusIndex][charIndex], hashBases[modulusIndex], primeModuli[modulusIndex]) + initialSequence.charCodeAt(charIndex);
        if(prefixHashes[modulusIndex][charIndex+1] >= primeModuli[modulusIndex]) prefixHashes[modulusIndex][charIndex+1] -= primeModuli[modulusIndex];
      }
    }
  }

  /**
   * Searches for occurrences of a substring within the main string.
   * @param {string} subString The substring to search for.
   * @param {number} [startIndex=0] The starting index in the main string to begin the search.
   * @returns {number} The starting index of the first match, or -1 if not found.
   */
  DoubleHasher.prototype.findSubstring=function(subString,startIndex){
    var subStringHashes=calculateStringHashes(subString); // Get hashes for the substring
    var subLength=subString.length;
    var numModuli=primeModuli.length;
    var searchLimit=currentStringLength-subLength+1; // Upper bound for search loop
    var matchCount=0; // Counter for matched moduli

    for(var mainStringIndex=startIndex||0; mainStringIndex < searchLimit; mainStringIndex++){
      var currentHash=getSegmentHash(mainStringIndex,mainStringIndex+subLength,0);
      // Check the first hash
      if(currentHash===subStringHashes[0]){
        matchCount=1;
        // Check subsequent hashes if the first one matches
        for(var modulusIteration=1; modulusIteration < numModuli; modulusIteration++){
          currentHash=getSegmentHash(mainStringIndex,mainStringIndex+subLength,modulusIteration);
          if(currentHash!==subStringHashes[modulusIteration]) break; // Mismatch, break and try next position
          matchCount++;
        }
        if(matchCount===numModuli) return mainStringIndex; // All moduli matched, substring found
      }
    }
    return -1; // Substring not found
  };

  /**
   * Appends an additional string to the current string and updates hashes.
   * @param {string} extraString The string to append.
   * @returns {number} The new total length of the string.
   */
  DoubleHasher.prototype.appendString=function(extraString){
    var previousLength=currentStringLength;
    currentStringLength=this.sequenceLength=currentStringLength+extraString.length;
    // Update hashes for each modulus
    for(var modulusIndex=0; modulusIndex < primeModuli.length; modulusIndex++){
      powerValues[modulusIndex].length=prefixHashes[modulusIndex].length=currentStringLength+1;
      // Calculate hashes for the newly appended part
      for(var charIndex=previousLength; charIndex < currentStringLength; charIndex++){
        powerValues[modulusIndex][charIndex+1]=multiplyModulo(powerValues[modulusIndex][charIndex],hashBases[modulusIndex],primeModuli[modulusIndex]);
        prefixHashes[modulusIndex][charIndex+1]=multiplyModulo(prefixHashes[modulusIndex][charIndex],hashBases[modulusIndex],primeModuli[modulusIndex])+extraString.charCodeAt(charIndex-previousLength);
        if(prefixHashes[modulusIndex][charIndex+1]>=primeModuli[modulusIndex]) prefixHashes[modulusIndex][charIndex+1]-=primeModuli[modulusIndex];
      }
    }
    return currentStringLength;
  };

  /**
   * Calculates the double hashes for a given string.
   * @param {string} targetString The string for which to calculate hashes.
   * @returns {number[]} An array containing the hash values for each modulus.
   */
  function calculateStringHashes(targetString){
    var hashResults=[];
    for(var modulusIndex=0; modulusIndex < primeModuli.length; modulusIndex++){
      var tempHash=0;
      for(var charIndex=0; charIndex < targetString.length; charIndex++){
        tempHash=multiplyModulo(tempHash,hashBases[modulusIndex],primeModuli[modulusIndex])+targetString.charCodeAt(charIndex);
      }
      if(tempHash>=primeModuli[modulusIndex]) tempHash-=primeModuli[modulusIndex];
      hashResults.push(tempHash);
    }
    return hashResults;
  }

  /**
   * Retrieves the hash of a segment (substring) of the main string.
   * Uses precomputed prefix hashes for O(1) retrieval.
   * @param {number} leftBoundary The starting index of the segment (inclusive).
   * @param {number} rightBoundary The ending index of the segment (exclusive).
   * @param {number} modIndex The index of the modulus/base pair to use.
   * @returns {number} The hash value of the specified segment.
   */
  function getSegmentHash(leftBoundary,rightBoundary,modIndex){
    var segmentHash=prefixHashes[modIndex][rightBoundary]-multiplyModulo(prefixHashes[modIndex][leftBoundary],powerValues[modIndex][rightBoundary-leftBoundary],primeModuli[modIndex]);
    if(segmentHash < 0) segmentHash+=primeModuli[modIndex]; // Ensure positive result
    return segmentHash;
  }

  /**
   * Performs modular multiplication: (a * b) % c.
   * Optimized for JavaScript's number representation to prevent overflow before modulo.
   * @param {number} operandA First operand.
   * @param {number} operandB Second operand.
   * @param {number} moduloValue The modulus.
   * @returns {number} The result of (a * b) % c.
   */
  function multiplyModulo(operandA,operandB,moduloValue){
    // This trick uses bitwise operations to break down multiplication
    // and apply modulo earlier, preventing large intermediate results.
    return ((operandA>>16)*operandB%moduloValue*65536+(operandA&65535)*operandB)%moduloValue;
  }
  return createDoubleHasher;
})();

global.print(primaryExecution()); // Use global.print for output.

/**
 * Main execution function for the program logic.
 * Reads two strings and determines a specific count based on their occurrences.
 * @returns {number} The calculated count.
 */
function primaryExecution(){
  var firstString=inputReader.nextAtom(1); // Read first string from input
  var secondString=inputReader.nextAtom(1); // Read second string from input

  var extendedFirstString=firstString;
  // Extend the first string until it's at least as long as the second string
  while(extendedFirstString.length < secondString.length) extendedFirstString+=firstString;

  // Initialize the double hasher with a doubled version of the extended first string
  // This allows searching for patterns that wrap around.
  var stringMatcher=DoubleHasher(extendedFirstString+extendedFirstString);

  var foundIndex=stringMatcher.findSubstring(secondString); // Find first occurrence of secondString
  if(foundIndex===-1) return 0; // If not found, count is 0

  var tempSecondString=secondString;
  var lastFoundPosition;
  var occurrenceCount=0;

  // Loop to find consecutive occurrences of the second string
  while(foundIndex >= 0){
    tempSecondString+=secondString; // Extend the search pattern
    lastFoundPosition=foundIndex; // Store the last valid found index
    occurrenceCount++;
    // Search for the extended pattern starting from the previous found index
    foundIndex=stringMatcher.findSubstring(tempSecondString,foundIndex);
  }

  // After the loop, the `tempSecondString` is `secondString` repeated `occurrenceCount` times.
  // We need to check if `tempSecondString` repeated `occurrenceCount` times
  // with one more `firstString` appended to the original `extendedFirstString`
  // can still match the `tempSecondString` (which is `secondString` * `occurrenceCount` + 1)
  // This is a subtle check for an edge case or boundary condition.

  // Append one more `extendedFirstString` to the hasher's internal string
  stringMatcher.appendString(extendedFirstString);
  // Check if the pattern `tempSecondString` (which grew) still matches
  // starting from the last successful position.
  // If it matches, it implies an infinite repetition, meaning -1.
  if(stringMatcher.findSubstring(tempSecondString,lastFoundPosition)>=0) return -1;
  return occurrenceCount; // Return the final count
}