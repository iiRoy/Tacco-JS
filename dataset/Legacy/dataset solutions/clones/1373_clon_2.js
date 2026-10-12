process.stdin.on(
  "data",
  function (inputBuffer) {
    // Convert the incoming data buffer to a string, remove leading/trailing whitespace,
    // and then split it into an array of individual lines.
    // The 'some' method is used to iterate over these lines, allowing for early termination.
    (String(inputBuffer))
      .trim()
      .split("\n")
      .some(function (currentLine) {
        // Divide the current line into parts based on space delimiters.
        let lineParts = currentLine.split(" ");

        // Extract the two numerical values from the line parts.
        // Initialize a counter for the number of valid combinations.
        let upperBound = Number(lineParts[0]);
        let targetSum = Number(lineParts[1]);
        let combinationCount = 0;

        // Check for the termination condition: if both numbers are zero.
        if (!upperBound && !targetSum) {
          return true; // Return true to stop the 'some' iteration.
        }

        // Begin a triple-nested loop to find combinations of three distinct integers (firstNum < secondNum < thirdNum).
        // The integers must be within the range [1, upperBound].
        for (let firstNum = 1; firstNum <= upperBound - 2; firstNum++) {
          for (let secondNum = firstNum + 1; secondNum <= upperBound - 1; secondNum++) {
            for (let thirdNum = secondNum + 1; thirdNum <= upperBound; thirdNum++) {
              // If the sum of the three chosen numbers equals the target sum, increment the counter.
              if (firstNum + secondNum + thirdNum === targetSum) {
                combinationCount++;
              }
            }
          }
        }

        // Print the final count of combinations found for the current input line.
        console.log(combinationCount);
        return false; // Return false to continue the 'some' iteration for the next line.
      });
  }
).resume(); // Ensure the standard input stream remains active to receive data.
