function ProcessData(rawData) {
    // The incoming rawData string is split into individual lines.
    // The first line is at index 0, the second at index 1, and so on.
    const lineSegments = rawData.split("\n");

    // Extracting parts from the second and fourth lines (index 1 and 3)
    const firstLineParts = lineSegments[1].split(" ");
    const thirdLineParts = lineSegments[3].split(" ");

    // Convert the first line to an integer, representing the count for the first dataset.
    const countA = parseInt(lineSegments[0], 10);
    // Initialize an array to store the first set of numbers.
    const dataA = [];
    // Loop through the parts of the second line to populate dataA.
    for (let idx = 0; idx < countA; idx++) {
        const currentValue = parseInt(firstLineParts[idx], 10);
        dataA.push(currentValue);
    }

    // Convert the third line to an integer, representing the count for the second dataset.
    const countB = parseInt(lineSegments[2], 10);
    // Initialize an array to store the second set of numbers.
    const dataB = [];
    // Loop through the parts of the fourth line to populate dataB.
    for (let idx = 0; idx < countB; idx++) {
        const currentValue = parseInt(thirdLineParts[idx], 10);
        dataB.push(currentValue);
    }

    // Create an object to act as a frequency map for elements in dataA.
    const frequencyMap = {};
    // Initialize counts for all unique elements in dataA to zero.
    for (let idx = 0; idx < countA; idx++) {
        frequencyMap[dataA[idx]] = 0;
    }
    // Populate the frequency map with actual counts of elements from dataA.
    for (let idx = 0; idx < countA; idx++) {
        frequencyMap[dataA[idx]]++;
    }

    // A boolean flag to track if all elements from dataB can be found and accounted for in dataA.
    let allFound = true;
    // Iterate through each element in dataB.
    for (let idx = 0; idx < countB; idx++) {
        // Check if the current element from dataB exists as a key in the frequency map,
        // or if its count is already zero.
        if (!frequencyMap[dataB[idx]] || frequencyMap[dataB[idx]] === 0) {
            allFound = false; // If not found or count is zero, set flag to false.
            break;            // No need to check further, exit the loop.
        } else {
            // If the element is found and its count is greater than zero, decrement its count.
            frequencyMap[dataB[idx]]--;
        }
    }

    // Output the result based on the final state of the 'allFound' flag.
    if (allFound) {
        console.log("YES");
    } else {
        console.log("NO");
    }
}

// This function is for debugging purposes, typically used in a browser environment.
function performDebug() {
    const inputElement = document.getElementById("input");
    const debugInput = inputElement.value;
    ProcessData(debugInput);
}

// The following line handles standard input/output for execution environments like Node.js.
// It reads the entire content from standard input and passes it to the main processing function.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
