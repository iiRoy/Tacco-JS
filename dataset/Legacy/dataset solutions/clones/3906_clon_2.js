function ProcessInput(rawData) {
    // Split the entire input string into an array of lines.
    const dataRows = rawData.split("\n");

    // Parse the first line to get the total count of numbers.
    let countElements = parseInt(dataRows[0]);

    // Process the second line: split by spaces and convert each part to an integer.
    let originalArray = dataRows[1].split(" ").map(itemStr => parseInt(itemStr));

    // Create a sorted duplicate of the array to determine median values.
    let orderedArray = originalArray.slice().sort((valA, valB) => valA - valB);

    // Identify the two middle elements (medians) from the sorted array.
    // For an even number of elements, these are N/2-1 and N/2.
    const firstMedian = orderedArray[countElements / 2 - 1];
    const secondMedian = orderedArray[countElements / 2];

    // Iterate through the original array and print the appropriate median for each element.
    // If an element is less than or equal to the first median, print the second median; otherwise, print the first.
    originalArray.forEach(currentValue => console.log(currentValue <= firstMedian ? secondMedian : firstMedian));
}

// Read the complete file content from the standard input path.
const fileContent = require('fs').readFileSync("/dev/stdin", "utf-8");

// Execute the main processing function with the obtained file content.
ProcessInput(fileContent);
