// This module provides utilities to parse input data from a source string.
var SOURCE_PARSER = (
  function() {

    // Factory function to create an instance of the data handler.
    function instantiateProcessor( rawContent ) {
      return new LineHandler(rawContent);
    }

    // Constructor for processing lines of content.
    function LineHandler( rawContent ) {
      /* Store the processed segments of the input string.
         Each segment is trimmed and split by newline characters. */
      this.contentSegments = rawContent.trim().split("\n");
    }

    // Retrieve a specific segment by its zero-based index.
    LineHandler.prototype.fetchSegment = function( segmentIndex ) {
      return this.contentSegments[segmentIndex];
    };

    // Retrieve a specific segment and parse it into an array of values.
    LineHandler.prototype.retrieveArrayItem = function( segmentIndex ) {
      return this.parseLineIntoArray(this.contentSegments[segmentIndex]);
    };

    // Extract a range of segments and convert each to a number/string.
    LineHandler.prototype.getSubSegments = function( startIndex, rangeLength ) {
      return this.contentSegments.slice(startIndex, +rangeLength + startIndex || undefined)
                                 .map(currentItem => this.processValue(currentItem));
    };

    // Extract a range of segments and convert each to an array of values.
    LineHandler.prototype.getSubArrays = function( startIndex, rangeLength ) {
      return this.contentSegments.slice(startIndex, +rangeLength + startIndex || undefined)
                                 .map(currentItem => this.parseLineIntoArray(currentItem));
    };

    // Convert a single line string into an array of processed values.
    LineHandler.prototype.parseLineIntoArray = function( inputLine ) {
      return inputLine.split(" ").map(itemString => this.processValue(itemString));
    };

    // Attempt to convert a value to a number; otherwise, return the original value.
    LineHandler.prototype.processValue = function( strOrNum ) {
      var convertedNum = +strOrNum; // Use unary plus for type conversion
      return (convertedNum === convertedNum) ? convertedNum : strOrNum;
    };

    // The factory function is the public interface of this module.
    return instantiateProcessor;
  }
)(); // Immediately Invoked Function Expression ends here.


// Obtain an instance of the data processor by reading from standard input.
// Note: 'require' and 'fs' are Node.js built-in identifiers.
var dataInstance = SOURCE_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

// Output the result of the main calculation function to the console.
console.log(performCalculation());


/**
 * Core logic function to perform calculations based on input data.
 * @returns {number} The final calculated numeric outcome.
 */
function performCalculation() {
  // Retrieve the total count of elements from the first line of input.
  var totalItems = dataInstance.fetchSegment(0);

  // Retrieve the array of numeric values from the second line of input.
  var numericValues = dataInstance.retrieveArrayItem(1);

  // Initialize a special index, defaults to zero.
  var criticalIndex = 0;

  // Loop backward from the second-to-last element to find a specific pattern.
  // This loop runs only once for scanPointer = totalItems - 1.
  for (var scanPointer = totalItems - 1; totalItems > scanPointer; scanPointer++) {
    // Check if the current element is greater than the previous one.
    if (numericValues[scanPointer] > numericValues[scanPointer - 1]) {
      criticalIndex = scanPointer; // Update the critical index.
      break; // Exit the loop immediately upon finding the pattern.
    }
  }

  // Initialize the result variable with a starting value.
  var calculatedValue = 1000;

  // Initialize a counter for items being processed.
  var itemCounter = 0;

  // Iterate through the numeric values array to perform the main calculation.
  for (var currentPosition = 0; totalItems > currentPosition; currentPosition++) {

    // Condition 1: If current position is the critical index OR
    // if the current value is greater than the next AND there are items in the counter.
    if (criticalIndex === currentPosition || (numericValues[currentPosition] > numericValues[currentPosition + 1] && itemCounter > 0)) {
      // Add the product of current value and item counter to the calculated value.
      calculatedValue += numericValues[currentPosition] * itemCounter;
      itemCounter = 0; // Reset the item counter.
      continue; // Move to the next iteration.
    }

    // Condition 2: If current value is less than the next AND
    // the calculated value is sufficient to cover the current item.
    if (numericValues[currentPosition] < numericValues[currentPosition + 1] && calculatedValue >= numericValues[currentPosition]) {
      // Calculate the remainder after dividing calculatedValue by the current numeric value.
      var temporaryHold = calculatedValue % numericValues[currentPosition];

      // Determine how many items can be "bought" or accounted for.
      itemCounter = (calculatedValue - temporaryHold) / numericValues[currentPosition];

      // Update the calculated value with the remainder.
      calculatedValue = temporaryHold;
    }
  }

  // Return the final calculated outcome.
  return calculatedValue;
}