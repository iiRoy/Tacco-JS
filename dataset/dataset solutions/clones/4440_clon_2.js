/*
 * This JavaScript module processes a sequence of numerical inputs
 * to determine if a specific condition related to divisibility holds true.
 */
function ProcessInputData(rawData) {
  // Normalize the input string by replacing all newline characters with spaces.
  let tokenizedData = rawData.replace(/\n/g, '   ');

  // Split the processed string into an array of individual tokens (strings).
  tokenizedData = tokenizedData.split(" ");

  // The first element is expected to be the total count of numbers to process.
  var countOfNumbers = tokenizedData[0];

  // Remove the count element from the beginning of the array.
  tokenizedData.shift();

  // Initialize counters for different types of numbers.
  // This counter tracks numbers perfectly divisible by four.
  var divisibleByFourCount = 0;

  // This counter tracks numbers divisible by two but not by four.
  var divisibleByTwoNotFourCount = 0;

  // This counter tracks odd numbers.
  var oddCount = 0;

  // Initialize the final outcome message.
  var finalVerdict = "No";

  // Iterate through the remaining numbers based on the initial count.
  for (var idx = 0; idx < countOfNumbers; idx++) {
    // Convert the current string token to a numerical value.
    var currentNumber = Number(tokenizedData[idx]);

    // Check divisibility conditions for the current number.
    if (currentNumber % 4 === 0) {
      // If divisible by 4, increment its respective counter.
      divisibleByFourCount++;
    } else if (currentNumber % 2 === 0) {
      // If divisible by 2 but not 4, increment its respective counter.
      divisibleByTwoNotFourCount++;
    } else {
      // Otherwise, it's an odd number; increment its counter.
      oddCount++;
    }
  }

  // Evaluate the collected counts to determine the final verdict.

  // Condition 1: If the count of odd numbers is less than or equal to
  // the count of numbers divisible by four.
  if (oddCount <= divisibleByFourCount) {
    finalVerdict = "Yes";
  }
  // Condition 2: If the count of odd numbers is exactly one more than
  // the count of numbers divisible by four, AND there are no numbers
  // divisible by two but not four.
  else if (divisibleByFourCount + 1 === oddCount && divisibleByTwoNotFourCount === 0) {
    finalVerdict = "Yes";
  }

  // Output the final decision to the console.
  console.log(finalVerdict);
}

// Invoke the main processing function with input read from standard input.
ProcessInputData(require("node:fs").readFileSync("/dev/stdin", "utf8"));