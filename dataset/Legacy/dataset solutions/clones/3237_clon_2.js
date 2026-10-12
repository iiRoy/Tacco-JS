// This function processes the incoming data stream.
function ProcessInput(rawData) {
    // Split the raw input into individual lines for further processing.
    let processedLines = rawData.split("\n");

    // Parse the first line to determine the number of elements to compare.
    const lineCount = parseInt(processedLines[0], 10);

    // Convert the subsequent lines into character arrays for element-wise comparison.
    const firstArray = processedLines[1].split("");
    const secondArray = processedLines[2].split("");
    const thirdArray = processedLines[3].split("");

    // Initialize counters to track differences between pairs of arrays.
    let diffOneTwo = 0; // Differences between firstArray and secondArray
    let diffOneThree = 0; // Differences between firstArray and thirdArray
    let diffTwoThree = 0; // Differences between secondArray and thirdArray

    // Loop through each character position up to the determined lineCount.
    for (let idx = 0; idx < lineCount; idx++) {
        // Increment diffOneTwo if characters at the current index in firstArray and secondArray are not identical.
        if (firstArray[idx] !== secondArray[idx]) {
            diffOneTwo++;
        }
        // Increment diffOneThree if characters at the current index in firstArray and thirdArray are not identical.
        if (firstArray[idx] !== thirdArray[idx]) {
            diffOneThree++;
        }
        // Increment diffTwoThree if characters at the current index in secondArray and thirdArray are not identical.
        if (secondArray[idx] !== thirdArray[idx]) {
            diffTwoThree++;
        }
    }

    // Calculate the total "cost" or differences associated with each array.
    // This represents the sum of differences when compared to the other two arrays.
    const totalDiffOne = diffOneTwo + diffOneThree;
    const totalDiffTwo = diffOneTwo + diffTwoThree;
    const totalDiffThree = diffOneThree + diffTwoThree;

    // Output the smallest of the three calculated total difference values.
    console.log('%d', Math.min(totalDiffOne, totalDiffTwo, totalDiffThree));
}

// The following line is responsible for reading input from standard input
// and passing it to the main processing function. It should remain unchanged
// to ensure proper execution in the target environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
