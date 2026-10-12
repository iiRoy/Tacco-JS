// This function processes the entire input string provided.
function ProcessInput(rawData) {
    // Divide the complete input into distinct line segments.
    const lineSegments = rawData.split("\n");

    // Parse the initial line to extract configuration parameters.
    const firstLineData = lineSegments[0].split(" ");

    // Determine the total number of data rows (N) from the first parameter.
    const numDataRows = parseInt(firstLineData[0], 10);
    // Determine the count of top sums (K) to consider from the second parameter.
    const numTopSums = parseInt(firstLineData[1], 10);

    // Extract the specific data entries based on the calculated number of rows.
    const foodItems = lineSegments.slice(1, numDataRows + 1);

    // Implement an early exit condition if the number of top sums required is zero.
    if (numTopSums === 0) {
        console.log(0);
        return;
    }

    // Convert the string-based food item data into a structured array of integer arrays.
    const numericData = foodItems.map((itemString) =>
        itemString.split(" ").map((numStr) => parseInt(numStr, 10))
    );

    // Perform a series of operations: sum each inner array, sort the sums in descending order,
    // select the top K sums, and then compute the total of these selected sums.
    const finalResult = numericData
        .map((innerArray) =>
            innerArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
        )
        .sort((leftVal, rightVal) => {
            // This comparison function sorts values in descending order.
            return leftVal < rightVal;
        })
        .slice(0, numTopSums)
        .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    // Display the final computed result to the console.
    console.log(finalResult);
}

// The following line is crucial for standard input/output handling and should not be altered.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
