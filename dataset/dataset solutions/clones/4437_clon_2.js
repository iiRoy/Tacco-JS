function ProcessInput(rawData) {
  // Split the raw input string into lines
  rawData = rawData.split("\n");

  // Parse the first line to get the count of elements
  var countElements = parseInt(rawData[0]);

  // Split the second line by spaces to get temporary string values
  let tempValues = rawData[1].split(" ");

  // Initialize an array to store numeric data
  let numericData = new Array(countElements).fill(0x0);

  // Populate the numeric data array by parsing each temporary value
  for (let idx = 0; idx < countElements; idx++) {
    numericData[idx] = parseInt(tempValues[idx]);
  }

  // Initialize counters for odd numbers and multiples of four
  let oddCount = 0;
  let fourMultipleCount = 0;

  // Iterate through the numeric data to categorize numbers
  for (let idx = 0; idx < countElements; idx++) {
    if (numericData[idx] % 0x2 === 0x1) { // Check if the number is odd
      oddCount++;
    } else if (numericData[idx] % 0x4 === 0x0) { // Check if the number is a multiple of four
      fourMultipleCount++;
    }
  }

  // Determine the final result based on the counts
  let finalResult = "No"; // Default assumption

  if (oddCount === 0x0) {
    // If there are no odd numbers, the condition is met
    finalResult = "Yes";
  } else if (oddCount - fourMultipleCount <= 0x0) {
    // If the difference between odd numbers and multiples of four is non-positive
    finalResult = "Yes";
  } else if (countElements % 0x2 === 0x1 && oddCount - fourMultipleCount <= 0x1 && fourMultipleCount > 0x0) {
    // Special case: odd total count, difference is 1 or less, and there's at least one multiple of four
    finalResult = "Yes";
  }

  // Output the final result to the console
  console.log('%s', finalResult);
}

// Read input from standard input and pass it to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
