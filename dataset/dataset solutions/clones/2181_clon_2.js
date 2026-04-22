// This section handles input processing and utility functions. It's generally boilerplate.
var terminalInput = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var inputDataHandler; // Manages processed input
var lineBuffer = [];  // Stores incoming lines

terminalInput.on('line', function(singleLine){
  lineBuffer.push(singleLine);
});

terminalInput.on('close', function(){
  inputDataHandler = initializeDataProcessor(lineBuffer);
  console.error('\n↑ Input Read ↓ Output Generated');
  performMainTask(); // Execute the primary logic
});

/**
 * Creates a deep copy of an object or a Set.
 * @param {object} sourceObject The object to clone.
 * @returns {object} A new, independent copy of the object.
 */
function createDeepCopy(sourceObject) {
  return (sourceObject instanceof Set)
    ? new Set(Array.from(sourceObject))
    : JSON.parse(JSON.stringify(sourceObject));
}

// Utility functions for fetching different data types
function retrieveNextInteger() { return convertAndParse(getNextDataItem(), 1); }
function retrieveStringArray() { return convertAndParse(getNextDataItem(), 2); }
function retrieveNumberArray() { return convertAndParse(getNextDataItem(), 4); }
function retrieveCharacterList() { return convertAndParse(getNextDataItem(), 6); }

function getNextDataItem() { return inputDataHandler.fetchNext(); }
function hasMoreInput() { return inputDataHandler.canProceed(); }

/**
 * Initializes an object to manage input lines.
 * @param {Array<string>} rawInputLines An array of strings representing input lines.
 * @returns {object} An object with methods to access input.
 */
function initializeDataProcessor(rawInputLines) {
  return {
    dataRecords: rawInputLines,
    currentPosition: 0,
    totalLength: rawInputLines.length,

    canProceed: function() {
      return (this.currentPosition < this.totalLength);
    },

    fetchNext: function() {
      if (this.canProceed()) {
        return this.dataRecords[this.currentPosition++];
      } else {
        throw new Error('EndOfInputException: No more input available to process');
      }
    }
  };
}

/**
 * Prints a value to the standard output.
 * @param {*} displayValue The value to be printed.
 */
function outputResult(displayValue) {
  console.log(displayValue);
}

/**
 * Logs a debug message to the error stream.
 * @param {*} debugPayload The data to inspect and log.
 */
function logDebugMessage(debugPayload) {
  console.error('DEBUG_INFO: ' + require('util').inspect(debugPayload, false, null));
}

/**
 * Converts or processes an input value based on the specified conversion type.
 * @param {*} inputValue The value to convert.
 * @param {number} conversionType The type of conversion to apply.
 *   1: Parse as integer.
 *   2: Split by space.
 *   4: Split by space and map to numbers.
 *   6: Split into individual characters.
 *   7: Split into individual characters and map to numbers.
 *   8: Join array elements with spaces.
 *   9: Join array elements with newlines.
 *   0: Join array elements without a separator.
 *   Default: Return input as is.
 * @returns {*} The converted or processed value.
 */
function convertAndParse(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1:  return parseInt(inputValue);
      case 2:  return inputValue.split(' ');
      case 4:  return inputValue.split(' ').map(Number);
      case 6:  return inputValue.split('');
      case 7:  return inputValue.split('').map(Number);
      case 8:  return inputValue.join(' ');
      case 9:  return inputValue.join('\n');
      case 0:  return inputValue.join('');
      default: return inputValue;
    }
  } catch (err) {
    // In case of conversion error, return original input
    return inputValue;
  }
}

// End of utility functions section ------------------------------------------

/**
 * The primary execution function of the program.
 * It reads an input string and a length, then calculates a specific count.
 */
function performMainTask() {
  var sequenceText = getNextDataItem();
  var segmentSize = retrieveNextInteger();

  var accumulatedCount = 0; // Stores the final result

  // Loop through all possible starting positions for segments
  for (var outerLoopIdx = 0; outerLoopIdx <= sequenceText.length - segmentSize; ++outerLoopIdx) {
    var currentSegment = ""; // Holds the current segment of the string

    // Build the current segment
    for (var innerLoopIdx = 0; innerLoopIdx < segmentSize; ++innerLoopIdx) {
      currentSegment += sequenceText[outerLoopIdx + innerLoopIdx];
    }

    var numericSegmentValue = convertAndParse(currentSegment, 1); // Convert segment to integer

    // Special handling for segments starting after the first position
    if (outerLoopIdx !== 0) {
      // If not the first segment, replace it with a string of all '9's of the same length
      numericSegmentValue = convertAndParse(Array(segmentSize).fill("9").join(""), 1);
    }

    // Iterate downwards from the numeric segment value
    for (var decrementingValue = numericSegmentValue; decrementingValue >= Math.pow(10, segmentSize - 1); --decrementingValue) {
      // Check if the current number contains the digit '0'
      if (decrementingValue.toString().indexOf("0") !== -1) {
        // Specific condition for segment size 3 and multiples of 100
        if (segmentSize === 3 && decrementingValue % 100 === 0) {
          accumulatedCount += calculatePartialResult(sequenceText.length - (outerLoopIdx + segmentSize), segmentSize - 1);
        } else {
          accumulatedCount += 9 * (sequenceText.length - (outerLoopIdx + segmentSize));
        }
      } else {
        accumulatedCount++; // Increment if no '0' is found
      }
    }
  }
  outputResult(accumulatedCount); // Display the final computed count
}

/**
 * Helper function to compute a partial result based on remaining length and sub-segment size.
 * This function has a similar structure to the main loop but with different parameters.
 * @param {number} totalDigits The total number of digits to consider.
 * @param {number} windowSize The size of the window/sub-segment.
 * @returns {number} The calculated partial sum.
 */
function calculatePartialResult(totalDigits, windowSize) {
  var fillerString = Array(totalDigits).fill("9").join(""); // Create a string of '9's
  var partialSum = 0;

  // Loop through possible starting positions for sub-segments
  for (var outerIdx = 0; outerIdx <= fillerString.length - windowSize; ++outerIdx) {
    var currentSlice = ""; // Holds the current sub-segment

    // Build the current sub-segment
    for (var innerIdx = 0; innerIdx < windowSize; ++innerIdx) {
      currentSlice += fillerString[outerIdx + innerIdx];
    }

    var evaluatedValue = convertAndParse(currentSlice, 1); // Convert sub-segment to integer

    // Special handling for sub-segments not at the first position
    if (outerIdx !== 0) {
      // If not the first sub-segment, replace it with all '9's
      evaluatedValue = convertAndParse(Array(windowSize).fill("9").join(""), 1);
    }

    // Iterate downwards from the evaluated value
    for (var iteratingValue = evaluatedValue; iteratingValue >= Math.pow(10, windowSize - 1); --iteratingValue) {
      // Check if the current number contains the digit '0'
      if (iteratingValue.toString().indexOf("0") !== -1) {
        partialSum += 9 * (fillerString.length - (outerIdx + windowSize));
      } else {
        partialSum++; // Increment if no '0' is found
      }
    }
  }
  return partialSum; // Return the computed partial sum
}

/**
 * A testing function to verify a different logic.
 * Counts numbers up to a limit 'upperBound' that have exactly 'desiredDigits' non-zero digits.
 * @param {number} upperBound The maximum number to check.
 * @param {number} desiredDigits The target count of non-zero digits.
 */
function verificationRoutine(upperBound, desiredDigits) {
  var testResult = 0; // Accumulator for the test count

  // Iterate through numbers from 1 to upperBound
  for (var currentNumber = 1; currentNumber <= upperBound; ++currentNumber) {
    var numberAsString = currentNumber.toString();
    var nonZeroDigitCount = 0; // Counts non-zero digits in the current number

    // Iterate through characters of the number string
    for (var charIndex = 0; charIndex < numberAsString.length; ++charIndex) {
      if (numberAsString[charIndex] !== '0') { // Note: '0' is a string here
        nonZeroDigitCount++;
      }
    }

    // If the non-zero digit count matches the desired count, increment testResult
    if (nonZeroDigitCount === desiredDigits) {
      testResult++;
    }
  }
  outputResult(testResult); // Display the result of the verification routine
}

// verificationRoutine(314159, 3); // Example call to the verification routine (commented out)