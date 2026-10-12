// Function to eliminate duplicate entries from an array-like structure
function deduplicateCollection(sourceList) {
  // Creates a new Set from the provided list, which automatically handles uniqueness,
  // then converts it back into an Array.
  return Array.from(new Set(sourceList));
}

// Primary execution function for processing input data
function ExecuteLogic(rawData) {
  // Parse the initial numerical parameters from the input array
  const firstVal = parseInt(rawData[0], 10); // The starting point of the range
  const secondVal = parseInt(rawData[1], 10); // The ending point of the range
  const divisorOne = parseInt(rawData[2], 10); // First divisor
  const divisorTwo = parseInt(rawData[3], 10); // Second divisor

  // Calculate the initial multiplier for divisorOne.
  // This ensures we start checking from the first multiple of divisorOne that is >= firstVal.
  let multiplierOne = firstVal % divisorOne !== 0 ? Math.floor(firstVal / divisorOne) + 1 : Math.floor(firstVal / divisorOne);
  // Calculate the initial multiplier for divisorTwo.
  // This ensures we start checking from the first multiple of divisorTwo that is >= firstVal.
  let multiplierTwo = firstVal % divisorTwo !== 0 ? Math.floor(firstVal / divisorTwo) + 1 : Math.floor(firstVal / divisorTwo);

  // An array to store all multiples of divisorOne and divisorTwo found within the specified range.
  const divisibleNumbers = [];

  // Loop to find all multiples of divisorOne within the [firstVal, secondVal] range.
  // Iterates as long as the current multiple is within or at the upper bound.
  while (divisorOne * multiplierOne <= secondVal) {
    divisibleNumbers.push(divisorOne * multiplierOne); // Add the multiple to our list
    multiplierOne++; // Move to the next potential multiple
  }

  // Loop to find all multiples of divisorTwo within the [firstVal, secondVal] range.
  // This loop is separate but follows the same logic as the previous one.
  while (divisorTwo * multiplierTwo <= secondVal) {
    divisibleNumbers.push(divisorTwo * multiplierTwo); // Add the multiple to our list
    multiplierTwo++; // Move to the next potential multiple
  }

  // The original code had commented-out console.log statements.
  // console.log(JSON.stringify(divisibleNumbers)); // For debugging: show all found multiples

  // Remove any duplicate numbers from the collected multiples.
  const distinctMultiples = deduplicateCollection(divisibleNumbers);
  // console.log(JSON.stringify(distinctMultiples)); // For debugging: show unique multiples

  // Calculate the total count of numbers in the range [firstVal, secondVal].
  // Then subtract the count of unique multiples found.
  // This gives the count of numbers in the range that are NOT multiples of divisorOne or divisorTwo.
  console.log(secondVal - firstVal + 1 - distinctMultiples.length);
}

// Entry point: Read input from standard input, parse it, and pass to the main logic function.
ExecuteLogic(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n|\s/));
