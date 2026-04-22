// This function orchestrates the processing of incoming textual data
function ProcessData(incomingTextBlob) {
  // Split the entire input content into an array, where each element is a line
  const linesOfContent = incomingTextBlob.split("\n");

  // Parse the second line (index 1) into an array of integers
  // Each number is separated by a space
  let numericalItems = linesOfContent[1].split(" ").map(strVal => parseInt(strVal, 10));

  // Initialize a counter for numbers divisible by 2 but not 4
  let multiplesOfTwoOnly = 0;
  // Initialize a counter for numbers divisible by 4
  let multiplesOfFour = 0;

  // Iterate over each item in the numerical array
  numericalItems.forEach(currentNumber => {
    // Check if the current number is perfectly divisible by 4
    if (currentNumber % 4 === 0) {
      multiplesOfFour++; // Increment the counter for multiples of four
    }
    // Otherwise, check if the current number is perfectly divisible by 2
    else if (currentNumber % 2 === 0) {
      multiplesOfTwoOnly++; // Increment the counter for multiples of two only
    }
  });

  // Adjust the count of numbers divisible by two only
  // Subtract two from the current count
  multiplesOfTwoOnly -= 2;
  // Ensure this count does not fall below zero
  multiplesOfTwoOnly = Math.max(multiplesOfTwoOnly, 0);

  // Get the total quantity of elements in our numerical sequence
  const totalElementCount = numericalItems.length;

  // Print a conditional outcome based on a specific calculation
  // The condition checks if (multiplesOfFour * 3 + multiplesOfTwoOnly) is greater than or equal to totalElementCount
  console.log(multiplesOfFour * 3 + multiplesOfTwoOnly >= totalElementCount ? "Acceptable" : "Unacceptable");
}

// Invoke the primary data processing function
// It reads content from standard input, decodes it as UTF-8, and removes leading/trailing whitespace
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8").trim());