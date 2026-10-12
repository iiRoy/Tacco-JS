function ProcessInput(rawData) {
  // The raw input string is split into an array of lines.
  let lineData = rawData.split("\n");

  // The second line of the input is considered the primary sequence string.
  const sequenceString = lineData[1];

  // This variable will hold the generated sequence of 'S' or 'W' characters.
  let resultSequence;

  // A boolean flag to track if a valid sequence has been identified and printed.
  let foundSolution = false;

  // Begin iterating through all four possible starting configurations for the sequence.
  // The first character of the sequence can be 'S' or 'W'.
  ["S", "W"].forEach(firstChar => {
    // The second character of the sequence can also be 'S' or 'W'.
    ["S", "W"].forEach(secondChar => {
      // Initialize a new array for the current sequence attempt, matching the length of the input string.
      resultSequence = new Array(sequenceString.length);
      // Assign the initial two characters based on the current iteration.
      resultSequence[0] = firstChar;
      resultSequence[1] = secondChar;

      // Populate the rest of the sequence based on a specific set of rules.
      for (let idx = 2; idx < sequenceString.length; idx++) {
        // The rule for determining the current character involves the previous character in the generated sequence
        // and the corresponding character in the input sequence string, using an XOR operation.
        if (resultSequence[idx - 1] === "W" ^ sequenceString[idx - 1] === "o") {
          // If the condition is met, the current character is the same as the character two positions back.
          resultSequence[idx] = resultSequence[idx - 2];
        } else {
          // Otherwise, a different rule applies based on the character two positions back.
          if (resultSequence[idx - 2] === "W") {
            // If the character two positions back was 'W', the current character becomes 'S'.
            resultSequence[idx] = "S";
          } else {
            // If the character two positions back was 'S', the current character becomes 'W'.
            resultSequence[idx] = "W";
          }
        }
      }

      // The following lines were commented out in the original code and are kept as such.
      // They appear to be for debugging purposes.
      // console.log(resultSequence.join(""));
      // console.log(resultSequence[0] === "S");
      // console.log(sequenceString[0] === "o");
      // console.log(resultSequence[resultSequence.length - 1] === resultSequence[1]);
      // console.log(resultSequence[0] === "S" ^ sequenceString[0] === "o" ^ resultSequence[resultSequence.length - 1] === resultSequence[1]);
      // console.log(resultSequence[resultSequence.length - 1] === "S" ^ sequenceString[resultSequence.length - 1] === "o" ^ resultSequence[resultSequence.length - 2] === resultSequence[0]);

      // Check if the generated sequence satisfies the specific boundary conditions.
      // This complex logical expression ensures the sequence forms a valid loop.
      if (
        !foundSolution &&
        (resultSequence[0] === "S" ^ sequenceString[0] === "o" ^ resultSequence[resultSequence.length - 1] === resultSequence[1]) &&
        (resultSequence[resultSequence.length - 1] === "S" ^ sequenceString[resultSequence.length - 1] === "o" ^ resultSequence[resultSequence.length - 2] === resultSequence[0])
      ) {
        // If a valid sequence is found and no solution has been output yet, print the joined sequence.
        console.log(resultSequence.join(""));
        // Set the flag to true to indicate a solution has been found, preventing further output.
        foundSolution = true;
      }
    });
  });

  // After checking all possible starting configurations, if no valid solution was found, print -1.
  if (!foundSolution) {
    console.log(-1);
  }
}

// This line is responsible for reading input from standard input and invoking the main processing function.
// It should remain unchanged to preserve the original input/output mechanism.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
