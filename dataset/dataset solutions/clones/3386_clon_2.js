// Main processing function for the input data
function ProcessInput(rawData) {
  // Split the raw input string by newlines and convert each part to a number.
  // This prepares the data for numerical operations.
  let numericData = rawData.split("\n").map(Number);

  // Remove the first element from the array.
  // This element is typically the count of subsequent numbers, which is not used in the logic.
  numericData.shift();

  // Calculate the sum of all numbers in the processed array.
  // This sum is used as an initial 'resultValue'.
  var resultValue = calculateTotalSum(numericData);

  // Check if the initial sum equals the number of elements in the array.
  // If true, it implies a specific condition, and 'resultValue' is reset to 1.
  if (resultValue === numericData.length) {
    resultValue = 0b1; // Using binary literal for 1
  }

  // Calculate the sum of numbers in the array, excluding any '1's.
  // If this non-one sum is odd, 'resultValue' is again reset to 1.
  if (calculateNonOneSum(numericData) % 0x2 === 0b1) { // Using hex literal for 2 and binary for 1
    resultValue = 0b1;
  }

  // Determine the final output based on the parity of 'resultValue'.
  // If 'resultValue' is odd, print "first"; otherwise, print "second".
  if (resultValue % 0x2 === 0b1) {
    console.log("first");
  } else {
    console.log("second");
  }
}

// Invoke the main processing function with data read from standard input.
// The input is read as UTF-8, and leading/trailing whitespace is removed.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());

// Helper function to compute the sum of all elements in a given array.
function calculateTotalSum(dataArray) {
  let accumulator = 0x0; // Using hex literal for 0
  // Iterate through each element of the array.
  for (let idx = 0, arrayLength = dataArray.length; idx < arrayLength; ++idx) {
    accumulator += dataArray[idx]; // Add current element to the accumulator.
  }
  return accumulator; // Return the final sum.
}

// Helper function to compute the sum of elements in an array,
// specifically excluding any elements that are equal to 1.
function calculateNonOneSum(dataArray) {
  let accumulator = 0x0; // Using hex literal for 0
  // Loop through the array elements.
  for (let idx = 0, arrayLength = dataArray.length; idx < arrayLength; ++idx) {
    // Only add the element to the sum if it is not equal to 1.
    if (dataArray[idx] !== 0b1) { // Using binary literal for 1
      accumulator += dataArray[idx];
    }
  }
  return accumulator; // Return the sum of non-one elements.
}
