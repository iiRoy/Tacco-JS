// This section contains auxiliary routines for input/output processing.
var lineParserModule = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var parsedInputData; // Stores the processed input data handler.
var capturedLines = []; // Array to hold all lines read from input.

// Event listener for each incoming line of data.
lineParserModule.on('line', function(receivedText) {
  capturedLines.push(receivedText);
});

// Event listener for when the input stream closes.
lineParserModule.on('close', function() {
  parsedInputData = initializeDataProcessor(capturedLines); // Initialize data handler.
  console.error('\n'); // Output a newline to error stream for formatting.

  var operationStartTime = Date.now(); // Record the starting time of the main operation.
  PerformPrimaryLogic(); // Execute the main program logic.
  var elapsedDuration = Date.now() - operationStartTime; // Calculate elapsed time.

  logDiagnostic('execution_time : ' + elapsedDuration + 'ms'); // Log execution time.
  logDiagnostic('memory_usage : ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB'); // Log memory usage.
});

// Creates a deep copy of an object or set.
function duplicateStructure(originalItem) {
  return (originalItem instanceof Set) ? new Set(Array.from(originalItem)) : JSON.parse(JSON.stringify(originalItem));
}

// Retrieves the next integer from the input stream.
function retrieveInteger() {
  return dataTransformer(fetchNext(), 100);
}

// Retrieves the next line as an array of strings.
function retrieveStringArray() {
  return dataTransformer(fetchNext(), 200);
}

// Retrieves the next line as an array of integers.
function retrieveIntegerArray() {
  return dataTransformer(fetchNext(), 300);
}

// Retrieves the next line as an array of characters.
function retrieveCharacterArray() {
  return dataTransformer(fetchNext(), 400);
}

// Fetches the next available item from the input data.
function fetchNext() {
  return parsedInputData.fetchNext();
}

// Checks if there is more data available in the input.
function hasMoreData() {
  return parsedInputData.hasMoreData();
}

// Initializes a data processor object from an array of input lines.
function initializeDataProcessor(sourceInputLines) {
  return {
    dataRows: sourceInputLines,
    currentPosition: 0,
    maximumEntries: sourceInputLines.length,

    // Method to check if there are more entries to process.
    hasMoreData: function() {
      return (this.currentPosition < this.maximumEntries);
    },

    // Method to retrieve the next entry from the data rows.
    fetchNext: function() {
      if (this.hasMoreData()) {
        return this.dataRows[this.currentPosition++];
      } else {
        throw 'InputBoundsExceededError : No more input lines are available';
      }
    }
  };
}

// Displays a message to the standard output.
function displayOutput(messageContent) {
  console.log(messageContent);
}

// Logs debug information to the error stream.
function logDiagnostic(debugInfo) {
  console.error('debug_info:' + require('util').inspect(debugInfo, false, null));
}

// Helper function for various data transformations.
// 'transformType' parameter indicates the desired conversion:
// 100: Parse as integer.
// 200: Split by space into string array.
// 300: Split by space and parse elements as integers.
// 400: Split by character into character array.
// 500: Split by character and parse elements as integers.
// 600: Join elements with spaces.
// 700: Join elements with newlines.
// 800: Join elements without any separator.
function dataTransformer(inputData, transformType) {
  try {
    switch (transformType) {
      case 100:
        return parseInt(inputData);
      case 200:
        return inputData.split(' ');
      case 300:
        return inputData.split(' ').map(Number);
      case 400:
        return inputData.split('');
      case 500:
        return inputData.split('').map(Number);
      case 600:
        return inputData.join(' ');
      case 700:
        return inputData.join('\n');
      case 800:
        return inputData.join('');
      default:
        return inputData;
    }
  } catch (conversionError) {
    return inputData; // Return original data on error.
  }
}

// End of auxiliary routines.
function PerformPrimaryLogic() {
  var dimensionSize = retrieveInteger(); // Get the size N for the square grid.
  var inputSequence = retrieveIntegerArray(); // Get the initial sequence of numbers.

  // Initialize a result grid of size N*N.
  var resultGrid = new Array(dimensionSize * dimensionSize);

  // First pass: Populate initial positions based on inputSequence.
  for (var rowIterator = 0; rowIterator < dimensionSize; rowIterator++) {
    resultGrid[inputSequence[rowIterator] - 1] = rowIterator + 1;
  }

  // Second pass: Fill in remaining null/undefined slots from '2' up to 'N'.
  for (var fillValue = 2; fillValue <= dimensionSize; fillValue++) {
    var remainingSlots = fillValue - 1; // Number of slots to fill with current 'fillValue'.
    for (var gridIndex = 0; gridIndex < dimensionSize * dimensionSize; gridIndex++) {
      if (resultGrid[gridIndex] == null) {
        remainingSlots--;
        resultGrid[gridIndex] = fillValue;
        if (remainingSlots == 0) {
          break; // All required slots for this 'fillValue' are filled.
        }
      } else if (resultGrid[gridIndex] == fillValue) {
        displayOutput("No"); // Duplicate found, invalid configuration.
        return;
      }
    }
  }

  // Third pass: Fill in remaining null/undefined slots from 'N-1' down to '1'.
  for (var reverseFillValue = dimensionSize - 1; reverseFillValue >= 1; reverseFillValue--) {
    var remainingSlots = dimensionSize - reverseFillValue; // Number of slots to fill.
    for (var gridIndex = dimensionSize * dimensionSize - 1; gridIndex >= 0; gridIndex--) {
      if (resultGrid[gridIndex] == null) {
        remainingSlots--;
        resultGrid[gridIndex] = reverseFillValue;
        if (remainingSlots == 0) {
          break; // All required slots for this 'reverseFillValue' are filled.
        }
      } else if (resultGrid[gridIndex] == reverseFillValue) {
        displayOutput("No"); // Duplicate found, invalid configuration.
        return;
      }
    }
  }

  // Final check: Ensure no null/undefined values remain in the grid.
  for (var finalCheckIndex = 0; finalCheckIndex < dimensionSize * dimensionSize; finalCheckIndex++) {
    if (resultGrid[finalCheckIndex] == null) {
      displayOutput("No"); // Grid is not fully populated.
      return;
    }
  }

  displayOutput("Yes"); // All conditions met, valid configuration.
  // Display the final grid, joined by spaces.
  displayOutput(dataTransformer(resultGrid, 600));
}