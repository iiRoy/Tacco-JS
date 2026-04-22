function calculateCombinations(inputString)
{  // This function processes a string input to determine a specific count based on two numerical values.
  var stringParts = inputString.split(' '); // Divides the input text into an array using space as a delimiter.
  var countS = Number(stringParts[0]);  // Converts the first segment of the array to a numerical quantity representing 'S' items.
  var countC = Number(stringParts[1]);  // Converts the second segment of the array to a numerical quantity representing 'C' items.
  var outcome = 0; // Initializes a variable to store the final computed value, starting at zero.

    // This block iterates to find combinations where one 'S' unit and two 'C' units are consumed together.
  while (countS >= 1 && countC >= 2)
  {
    countS = countS - 1; // Decrements the 'S' unit count by one for each successful combination.
    countC = countC - 2; // Decrements the 'C' unit count by two for each successful combination.
    outcome = outcome + 1; // Increments the total number of combinations found.
  }

  // This block continues to find combinations using only 'C' units, where four 'C' units form one combination.
  while (countC >= 4)
  {
    countC -= 4; // Reduces the 'C' unit count by four.
    outcome++; // Increases the total combination tally.
  }
  console.log(outcome); // Prints the final calculated total of combinations to the console.
}

// A commented-out line showing how the function could be called with a direct string.
// calculateCombinations("50 100");
calculateCombinations(require("fs").readFileSync("/dev/stdin", "utf8")); // Executes the core logic by reading data from standard input.