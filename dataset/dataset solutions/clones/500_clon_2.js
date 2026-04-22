// Module for file system operations is obtained.
var fileSystemUtility = require('fs');

// All raw data is read from the standard input stream.
var rawInputData = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');

// The acquired input string is processed: whitespace trimmed, then split into an array of lines.
var processedDataLines = rawInputData.trim().split("\n");

// An indefinite loop commences to process blocks of data.
while (true) {
    // The first line of the current block is extracted and converted to a numerical size indicator.
    var currentBlockSize = processedDataLines.shift() - 0;

    // If the block size is zero, it signals the termination of input processing.
    if (currentBlockSize === 0) break;

    // A loop iterates over each individual data item within the determined block size.
    for (var currentDataItemIndex = 0; currentDataItemIndex < currentBlockSize; currentDataItemIndex++) {
        // The next line is retrieved, segmented by spaces, and each segment is mapped to a Number type.
        var componentValues = processedDataLines.shift().split(" ").map(Number);

        // Components of the first quaternion are assigned from the parsed values.
        var quaternionOneReal = componentValues[0];
        var quaternionOneImagI = componentValues[1];
        var quaternionOneImagJ = componentValues[2];
        var quaternionOneImagK = componentValues[3];

        // Components of the second quaternion are assigned from the parsed values.
        var quaternionTwoReal = componentValues[4];
        var quaternionTwoImagI = componentValues[5];
        var quaternionTwoImagJ = componentValues[6];
        var quaternionTwoImagK = componentValues[7];

        // Initialization of the product quaternion's components based on the real part of the first quaternion.
        var productRealComponent = quaternionOneReal * quaternionTwoReal;
        var productImagIComponent = quaternionOneReal * quaternionTwoImagI;
        var productImagJComponent = quaternionOneReal * quaternionTwoImagJ;
        var productImagKComponent = quaternionOneReal * quaternionTwoImagK;

        // Accumulation of terms involving the 'i' imaginary part of the first quaternion.
        productImagIComponent += quaternionOneImagI * quaternionTwoReal;
        productRealComponent -= quaternionOneImagI * quaternionTwoImagI;
        productImagKComponent += quaternionOneImagI * quaternionTwoImagJ;
        productImagJComponent -= quaternionOneImagI * quaternionTwoImagK;

        // Accumulation of terms involving the 'j' imaginary part of the first quaternion.
        productImagJComponent += quaternionOneImagJ * quaternionTwoReal;
        productImagKComponent -= quaternionOneImagJ * quaternionTwoImagI;
        productRealComponent -= quaternionOneImagJ * quaternionTwoImagJ;
        productImagIComponent += quaternionOneImagJ * quaternionTwoImagK;

        // Accumulation of terms involving the 'k' imaginary part of the first quaternion.
        productImagKComponent += quaternionOneImagK * quaternionTwoReal;
        productImagJComponent += quaternionOneImagK * quaternionTwoImagI;
        productImagIComponent -= quaternionOneImagK * quaternionTwoImagJ;
        productRealComponent -= quaternionOneImagK * quaternionTwoImagK;

        // The computed components of the quaternion product are then printed to the console.
        console.log(productRealComponent + " " + productImagIComponent + " " + productImagJComponent + " " + productImagKComponent);
    }
}