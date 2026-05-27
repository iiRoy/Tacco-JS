var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var dataProcessor;
var inputLines = [];

inputReader.on('line', function(singleLine){
  inputLines.push(singleLine);
});

inputReader.on('close', function(){
  dataProcessor = initializeInputHandler(inputLines);
  console.error('\n↑入力 ↓出力');
  executePrimaryLogic();
});

/**
 * Creates a deep copy of an object or Set.
 * This function is defined but not used in the main logic.
 * @param {any} originalObject The object to clone.
 * @returns {any} A deep copy of the original object.
 */
function createDeepCopy(originalObject){
  return (originalObject instanceof Set) ? new Set(Array.from(originalObject)) : JSON.parse(JSON.stringify(originalObject));
}

/**
 * Retrieves the next integer from the input stream.
 * @returns {number} The parsed integer.
 */
function getNextInteger(){
  return convertInput(fetchNextItem(), 1);
}

/**
 * Retrieves the next line as an array of strings, split by space.
 * @returns {string[]} An array of strings.
 */
function getNextStringArray(){
  return convertInput(fetchNextItem(), 2);
}

/**
 * Retrieves the next line as an array of integers, split by space.
 * @returns {number[]} An array of numbers.
 */
function getNextIntegerArray(){
  return convertInput(fetchNextItem(), 4);
}

/**
 * Retrieves the next line as an array of characters.
 * @returns {string[]} An array of characters.
 */
function getNextCharacterArray(){
  return convertInput(fetchNextItem(), 6);
}

/**
 * Fetches the next raw line from the input handler.
 * @returns {string} The next line of input.
 */
function fetchNextItem(){
  return dataProcessor.retrieveNext();
}

/**
 * Checks if there are more items available in the input stream.
 * @returns {boolean} True if more items exist, false otherwise.
 */
function hasMoreItems(){
  return dataProcessor.checkAvailability();
}

/**
 * Initializes an object to manage input lines, providing methods for sequential access.
 * @param {string[]} lines An array of strings representing input lines.
 * @returns {object} An input handler object.
 */
function initializeInputHandler(lines){
  return {
    dataCollection : lines,
    currentPosition : 0,
    maximumEntries : lines.length,

    /**
     * Determines if there are more input lines to process.
     * @returns {boolean} True if more lines are available.
     */
    checkAvailability : function(){
      return (this.currentPosition < this.maximumEntries);
    },

    /**
     * Retrieves the next input line and advances the position.
     * Throws an error if no more input is available.
     * @returns {string} The next input line.
     * @throws {string} If the end of input is reached.
     */
    retrieveNext : function(){
      if(this.checkAvailability()){
        return this.dataCollection[this.currentPosition++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}

/**
 * Prints a given message to the standard output.
 * @param {any} message The content to be printed.
 */
function printOutput(message){
  console.log(message);
}

/**
 * Logs a debug message to the standard error stream.
 * @param {any} debugInfo The information to inspect and log.
 */
function logDebugMessage(debugInfo){
  console.error('debug:' + require('util').inspect(debugInfo, false, null));
}

/**
 * Converts an input item based on a specified conversion type code.
 * @param {any} inputItem The item to convert.
 * @param {number} conversionType The type of conversion (e.g., 1 for parseInt, 2 for split by space).
 * @returns {any} The converted item.
 */
function convertInput(inputItem, conversionType){
  try {
    switch(conversionType){
      case 1: return parseInt(inputItem);
      case 2: return inputItem.split(' ');
      case 4: return inputItem.split(' ').map(Number);
      case 6: return inputItem.split('');
      case 7: return inputItem.split('').map(Number);
      case 8: return inputItem.join(' ');
      case 9: return inputItem.join('\n');
      case 0: return inputItem.join('');
      default: return inputItem;
    }
  } catch(error) {
    return inputItem;
  }
}

/**
 * The main function containing the core logic of the program.
 * It processes an input string and an integer K to calculate a specific count.
 */
function executePrimaryLogic(){
  var inputString = fetchNextItem();
  var targetLength = getNextInteger();
  var finalCount = 0;

  // Loop through all possible starting positions for a substring of length targetLength.
  for(var outerIndex = 0; outerIndex < inputString.length - targetLength + 1; outerIndex++){
    var currentSubstring = "";
    // Extract the substring of length targetLength.
    for(var innerIndex = 0; innerIndex < targetLength; innerIndex++){
      currentSubstring += inputString[outerIndex + innerIndex];
    }

    var currentNumber = convertInput(currentSubstring, 1);

    // If this is not the very first substring,
    // treat the current number as a sequence of '9's of length targetLength.
    if(outerIndex != 0){
      currentNumber = convertInput(new Array(targetLength).fill("9").join(""), 1);
    }

    // Iterate downwards from the current number to the smallest number with targetLength digits.
    for(var segmentInnerNumber = currentNumber; segmentInnerNumber >= Math.pow(10, targetLength - 1); segmentInnerNumber--){
      // Check if the current number contains the digit '0'.
      if(segmentInnerNumber.toString().indexOf("0") != -1){
        // Special condition for targetLength = 3 and the number being a multiple of 100.
        if(targetLength == 3 && segmentInnerNumber % 100 == 0){
          // Recursively call calculateSubCount for the remaining part.
          finalCount += calculateSubCount(inputString.length - (outerIndex + targetLength), targetLength - 1);
        } else {
          // Add 9 times the count of remaining digits.
          finalCount += 9 * (inputString.length - (outerIndex + targetLength));
        }
      } else {
        // If no '0' is found, increment the count by 1.
        finalCount++;
      }
    }
  }
  printOutput(finalCount);
}

/**
 * A helper function that calculates a count for sub-segments,
 * mirroring the logic of the main loop for a smaller problem.
 * @param {number} digitCount The total number of digits available for the segment.
 * @param {number} segmentLength The length of the segment to consider.
 * @returns {number} The calculated count for the sub-segment.
 */
function calculateSubCount(digitCount, segmentLength){
  // Create a string of '9's representing the maximum possible number for 'digitCount' digits.
  var fillerString = new Array(digitCount).fill("9").join("");
  var segmentResult = 0;

  // Loop through all possible starting positions for a sub-segment of length segmentLength.
  for(var segmentOuterIndex = 0; segmentOuterIndex < fillerString.length - segmentLength + 1; segmentOuterIndex++){
    var currentSegment = "";
    // Extract the sub-segment of length segmentLength.
    for(var innerLoopVar = 0; innerLoopVar < segmentLength; innerLoopVar++){
      currentSegment += fillerString[segmentOuterIndex + innerLoopVar];
    }

    var currentSegmentNumber = convertInput(currentSegment, 1);

    // If this is not the very first sub-segment,
    // treat the current number as a sequence of '9's of length segmentLength.
    if(segmentOuterIndex != 0){
      currentSegmentNumber = convertInput(new Array(segmentLength).fill("9").join(""), 1);
    }

    // Iterate downwards from the current segment number to the smallest number with segmentLength digits.
    for(var segmentInnerNumber = currentSegmentNumber; segmentInnerNumber >= Math.pow(10, segmentLength - 1); segmentInnerNumber--){
      // Check if the current number contains the digit '0'.
      if(segmentInnerNumber.toString().indexOf("0") != -1){
        // If '0' is found, add 9 times the count of remaining digits.
        segmentResult += 9 * (fillerString.length - (segmentOuterIndex + segmentLength));
      } else {
        // If no '0' is found, increment the count by 1.
        segmentResult++;
      }
    }
  }
  return segmentResult;
}

/**
 * A debug function (currently commented out in the original code).
 * It calculates the count of numbers up to a given upperBound that have
 * exactly a specified number of non-zero digits.
 * @param {number} upperBound The upper limit for numbers to check.
 * @param {number} requiredNonZeroDigits The target count of non-zero digits.
 */
function performDebugCheck(upperBound, requiredNonZeroDigits){
  var debugResult = 0;
  // Iterate from 1 up to the upperBound.
  for(var currentNum = 1; currentNum <= upperBound; currentNum++){
    var currentNumberString = currentNum.toString();
    var nonZeroDigitCount = 0;
    // Count non-zero digits in the current number string.
    for(var charIndex = 0; charIndex < currentNumberString.length; charIndex++){
      if(currentNumberString[charIndex] != 0){
        nonZeroDigitCount++;
      }
    }
    // If the count matches the required number, increment the debug result.
    if(nonZeroDigitCount == requiredNonZeroDigits){
      debugResult++;
    }
  }
  printOutput(debugResult);
}

// Example call to the debug function (commented out in the original source).
// performDebugCheck(314159, 3);
