function ProcessInput(rawData) {
  // Convert the raw input string into a numerical limit for iteration.
  let limitVal = Number(rawData);

  // Initialize a variable to store the number with the maximum divisions by 2.
  // The first element holds the number itself, the second holds its division count.
  let bestResult;

  // Special handling for the case where the input limit is 1.
  if (limitVal === 1) {
    bestResult = [1, 0]; // If N is 1, the number is 1, and it has 0 divisions by 2.
  } else {
    bestResult = [0, 0]; // For other cases, initialize with a default placeholder.
  }

  // Iterate through numbers from 1 up to the specified limit.
  for (let idx = 1; idx <= limitVal; idx++) {
    // Initialize a counter for the current number's divisions by 2.
    let currentDivisions = 0;

    // Calculate the number of times the current index can be divided by 2.
    currentDivisions = calculateDivisions(idx, currentDivisions);

    // Compare the current number's division count with the best recorded so far.
    if (bestResult[1] < currentDivisions) {
      // If the current number has more divisions, update the best result.
      bestResult = [idx, currentDivisions];
    }
  }

  // This nested function recursively counts how many times a number can be divided by 2.
  // 'num' is the number currently being checked.
  // 'tempCount' accumulates the count of divisions.
  function calculateDivisions(num, tempCount) {
    // Check if the number is even.
    if (num % 2 === 0) {
      tempCount++; // Increment the division counter.
      // Recursively call the function with the number halved.
      return calculateDivisions(num / 2, tempCount);
    } else {
      // If the number is odd, it cannot be divided by 2 further, so return the current count.
      return tempCount;
    }
  }

  // Output the number that had the maximum count of divisions by 2.
  console.log(bestResult[0]);
}

// Read the input from standard input (e.g., a file or pipe) and pass it to the main function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
