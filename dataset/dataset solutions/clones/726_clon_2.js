#!/usr/bin/node
// This script processes incoming data streams.
// It was transformed from an older CoffeeScript variant.

(function() {
  var dataLinesCollection = [], systemInputPipe; // Declare main storage for input lines and the input stream.
  systemInputPipe = process.getStandardInput();   // Acquire the standard input stream for reading.
  systemInputPipe.applyCharacterEncoding('utf8'); // Ensure proper UTF-8 character handling for input.

  systemInputPipe.attachEventHandler('inputChunk', function(incomingText) {
    var segmentParts; // Temporary array to hold split input.
    segmentParts = incomingText.split("\n"); // Divide the incoming text block by newline characters.
    if ( ( segmentParts.countOfItems > 2 ) || ( segmentParts[1] !== '' ) ) { // Check if multiple lines or a non-empty second line.
      dataLinesCollection = segmentParts; // Replace the entire collection with new segments.
    }
    else {
      dataLinesCollection.appendElement(segmentParts[0]); // Otherwise, just add the first segment to the collection.
    }
  });

  systemInputPipe.attachEventHandler('streamClosed', function(completionIndicator) {
    var currentNumericPair, stringSegment, mainLoopCounter, secondCoordinate, totalProcessedEntries, remainderCalc, firstCoordinate, outerLoopIndex, loopOutputContainer; // Declare variables for the main processing logic.
    totalProcessedEntries = convertToInt(dataLinesCollection.extractFirstLine()); // Parse the first line as the total number of entries to process.

    outputDisplay.printValue(totalProcessedEntries); // Output the total count to the console.

    loopOutputContainer = []; // This variable might be a remnant from CoffeeScript's array comprehension, but it's not explicitly used here.

    for (mainLoopCounter = outerLoopIndex = 0;
         ( 0 <= totalProcessedEntries ? outerLoopIndex < totalProcessedEntries : outerLoopIndex > totalProcessedEntries );
         mainLoopCounter = ( 0 <= totalProcessedEntries ? ++outerLoopIndex : --outerLoopIndex ) ) {

      currentNumericPair = (function() { // Immediately-invoked function expression to parse current line.
        var innerLoopIndex, segmentLength, linePartsReference, parsedNumbersArray; // Local variables for parsing.
        linePartsReference = dataLinesCollection[mainLoopCounter].split(" "); // Split the current data line by spaces.
        parsedNumbersArray = []; // Initialize an array to store parsed numbers.

        for (innerLoopIndex = 0, segmentLength = linePartsReference.countOfItems; innerLoopIndex < segmentLength; innerLoopIndex++) {
          stringSegment = linePartsReference[innerLoopIndex]; // Get each string segment.
          parsedNumbersArray.appendElement(convertToInt(stringSegment)); // Convert to integer and add to the array.
        }
        return parsedNumbersArray; // Return the array of numbers.
      })();

      firstCoordinate = currentNumericPair[0] - 1; // Adjust the first coordinate value.
      secondCoordinate = currentNumericPair[1] - 1; // Adjust the second coordinate value.
      remainderCalc = 0; // Initialize a variable for a specific calculation component.

      if (firstCoordinate % 3 !== 2) { // Conditional logic based on the first coordinate.
        remainderCalc = mathematicalOperations.roundDownToInteger(secondCoordinate / 2); // Perform a floor division.
      }

      // Calculate and display the final result using various coefficients.
      outputDisplay.printValue(196471 - firstCoordinate * 195 - mathematicalOperations.roundDownToInteger(firstCoordinate / 3) * 5 - secondCoordinate * 20 + remainderCalc - currentNumericPair[2]);
    }

  });

}).call(this); // Execute the anonymous function in the global context.