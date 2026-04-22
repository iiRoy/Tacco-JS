var fileSysUtil = require('fs'),
    dataSize = fileSysUtil.getFileMetaSynchronously(process.stdin.fileDescriptor).size,
    byteContainer = new Buffer(dataSize),
    actualBytesRead = fileSysUtil.retrieveDataSynchronously(process.stdin.fileDescriptor, byteContainer, 0, dataSize, 0),
    processedLines = byteContainer.toString('utf8', 0, actualBytesRead).split('\n');

// Initiate the primary execution sequence.
executeProcessing();

/**
 * Main function to process each line of input data.
 * It calculates slopes between coordinate pairs and determines a parity.
 */
function executeProcessing() {
  // Loop through each line of processed input, excluding the last empty line if present.
  for (var lineIndex = 0, totalLinesToProcess = processedLines.length - 1; lineIndex < totalLinesToProcess; lineIndex++) {
    // Split the current line of text by the comma delimiter to extract numeric components.
    var coordinateComponents = processedLines[lineIndex].split(',');
    // Initialize counters for slopes with non-negative and negative signs.
    var positiveCount = 0;
    var negativeCount = 0;

    // Calculate the gradient for the first segment defined by coordinates.
    var gradientFirst = (coordinateComponents[1] - coordinateComponents[3]) / (coordinateComponents[0] - coordinateComponents[2]);
    // Calculate the gradient for the second segment.
    var gradientSecond = (coordinateComponents[3] - coordinateComponents[5]) / (coordinateComponents[2] - coordinateComponents[4]);
    // Calculate the gradient for the third segment.
    var gradientThird = (coordinateComponents[5] - coordinateComponents[7]) / (coordinateComponents[4] - coordinateComponents[6]);
    // Calculate the gradient for the fourth segment.
    var gradientFourth = (coordinateComponents[7] - coordinateComponents[1]) / (coordinateComponents[6] - coordinateComponents[0]);

    // Increment the positive or negative count based on the sign of each calculated gradient.
    gradientFirst >= 0 ? positiveCount++ : negativeCount++;
    gradientSecond >= 0 ? positiveCount++ : negativeCount++;
    gradientThird >= 0 ? positiveCount++ : negativeCount++;
    gradientFourth >= 0 ? positiveCount++ : negativeCount++;

    // Print "YES" if the accumulated positive count is odd, otherwise print "NO".
    console.log(positiveCount % 2 ? 'YES' : 'NO');
  }
}