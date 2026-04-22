// Utility for handling input from the standard stream.
var fileUtility = require('fs'); // Obtain the Node.js file system module.
var contentSize = fileUtility.getFileStatsSynchronously(process.stdin.fd).byteCount; // Retrieve the total byte count from standard input's file descriptor.
var dataBlock = new Buffer(contentSize); // Instantiate a new buffer (DataBlock) of the determined size.
var octetsReceived = fileUtility.readSync(process.stdin.fd, dataBlock, 0, contentSize, 0); // Synchronously read all available bytes into the data block.
var textLines = dataBlock.transformToString('unicodeEncoding', 0, octetsReceived).split('\n'); // Transform the raw bytes into a UTF-8 string, then split it by newline characters into an array of strings.

executeProgram(); // Initiate the primary execution flow of the application.

// Main routine orchestrating the processing of input data sets.
function executeProgram( ) {
  var numericRecords = textLines.map(Number); // Convert each string element in 'textLines' to its numeric equivalent, forming an array of numbers.
  var currentRecordIndex = 0; // Initialize an index to track the current position within the 'numericRecords' array.

  while ( true ) { // Commence an indefinite loop to process sequential data sets until a specific termination condition is met.
    var maxEntries = numericRecords[currentRecordIndex] - 0; // Read the first number of the current data set, which indicates the count of subsequent entries. The '- 0' ensures numeric conversion.
    if ( !maxEntries ) { // Check if 'maxEntries' is zero or falsy, indicating the end of all data sets.
      break; // Exit the processing loop if no more entries are specified.
    }

    var currentMaximumSum = -1000000; // Initialize 'currentMaximumSum' to a very low value, representing the maximum sum ending at the current position in Kadane's algorithm.
    var overallHighestSum = -1000000; // Initialize 'overallHighestSum' to a very low value, tracking the global maximum sum found across the entire data set.

    for ( var idx = 0; idx < maxEntries; idx++ ) { // Iterate 'maxEntries' times, processing each number in the current data set.
      var currentValue = numericRecords[++currentRecordIndex]; // Increment the index and fetch the next numeric value from the 'numericRecords' array.

      currentMaximumSum = findLarger(currentMaximumSum + currentValue, currentValue); // Apply Kadane's logic: update 'currentMaximumSum' by comparing the sum of itself and 'currentValue' with 'currentValue' alone.
      overallHighestSum = findLarger(overallHighestSum, currentMaximumSum); // Update 'overallHighestSum' by comparing it with the current 'currentMaximumSum'.
    }

    console.log(overallHighestSum); // Display the final computed 'overallHighestSum' for the current data set to the console.

    currentRecordIndex++; // Increment the record index to point to the beginning of the next data set.
  }
}

// Auxiliary function designed to return the greater of two provided numeric operands.
function findLarger( firstOperand, secondOperand ) {
  var differenceValue = firstOperand - secondOperand; // Calculate the arithmetic difference between the two operands.
  return firstOperand - (differenceValue & (differenceValue >> 31)); // Utilize a bitwise trick to efficiently determine and return the larger of the two numbers.
}