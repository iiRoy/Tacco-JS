process.stdin.resume();
process.stdin.setEncoding('utf-8'); // Set the encoding for incoming data.

var receivedDataBuffer = ''; // Buffer to accumulate all input data.

// Event listener for incoming data chunks.
process.stdin.on
(
    'data',
    (dataPortion) => {
        receivedDataBuffer += dataPortion;
    }
);

// Event listener for the end of input stream.
process.stdin.on
(
    'end',
    () => {
        // Split the accumulated buffer into individual lines.
        var inputLines = receivedDataBuffer.split('\n');
        // Invoke the main processing logic with the parsed lines.
        executeMainLogic(inputLines);
    }
);

// Main function to process the input dataset.
var executeMainLogic = (dataSet) => {
    // Extract the first element, which indicates the number of subsequent items.
    var countOfItems = dataSet.shift();
    // Get a slice of the array containing the actual data items.
    var segmentList = dataSet.slice(0, countOfItems);

    // Initialize a 3D array (4x3x10) with zeroes.
    // This structure will store aggregated values based on input coordinates.
    var structureLevels = new Array(4).fill(null)
                                      .map(_ => new Array(3).fill(null)
                                                            .map(_ => new Array(10).fill(0)));

    // Iterate over each record in the segment list.
    segmentList.forEach(currentRecord => {
        // Parse the string record into an array of integers.
        var parsedValues = currentRecord.split(' ').map(valStr => parseInt(valStr, 10));
        // Aggregate the fourth value into the 3D array at the specified coordinates.
        // Coordinates are 1-based in input, so adjust to 0-based.
        structureLevels[parsedValues[0] - 1][parsedValues[1] - 1][parsedValues[2] - 1] += parsedValues[3];
    });

    // Output the contents of the 3D array.
    structureLevels.forEach((levelData, levelIndex) => {
        var outputLineBuffer = ''; // Buffer to build each output line.
        levelData.forEach(roomData => {
           roomData.forEach(cellValue => {
               outputLineBuffer += ' ' + cellValue; // Append each value with a leading space.
           });
           console.log(outputLineBuffer); // Print the completed line for the current row.
           outputLineBuffer = ''; // Reset the buffer for the next row.
        });
        // Print a separator between major sections, unless it's the last section.
        if (levelIndex !== structureLevels.length - 1) {
            console.log('####################');
        }
    });
};