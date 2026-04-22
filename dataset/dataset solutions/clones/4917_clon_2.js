// This primary function orchestrates the analysis of a given text string.
function processInputData(inputString) {
  // Ascertain the total character count of the supplied textual content.
  const stringLength = inputString.length;

  // Initialize a numeric accumulator to track specific character occurrences.
  let pCounter = 0;

  // Traverse through each individual character within the input sequence.
  for (let charIndex = 0; charIndex < stringLength; charIndex++) {
    // If the character at the current position matches 'p', increment the dedicated counter.
    if (inputString[charIndex] === "p") {
      pCounter++;
    }
  }

  // Compute a final numerical value based on the string's length and the tallied character,
  // then output this result, rounded down to the nearest whole number, to the standard console.
  console.log(
    Math.floor(
      stringLength / 2 - pCounter
    )
  );
}

// Acquire the raw data from the standard input stream,
// ensure all leading and trailing whitespace is removed,
// and subsequently pass this prepared data to the main processing routine.
processInputData(
  require("fs")
    .readFileSync("/dev/stdin", "utf8")
    .trim()
);