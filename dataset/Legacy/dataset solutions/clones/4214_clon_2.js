function ProcessInput(dataString) {
  // Iterate through each possible digit from one to nine.
  for (let digitIndex = 1; digitIndex < 10; digitIndex++) {
    // Construct a regular expression to find all occurrences of the current digit.
    const digitPattern = new RegExp(String(digitIndex), 'g');
    // Attempt to find all matches of this digit within the provided input string.
    const matchesArray = dataString.match(digitPattern);

    // Verify if the current digit pattern actually exists in the string.
    // The 'match' method can return null if no matches are found, so a test is prudent.
    if (digitPattern.test(dataString)) {
      // If the digit appears more than two times, fulfill the condition.
      if (matchesArray.length > 2) {
        console.log('Yes'); // Output the positive result.
        return; // Exit the function immediately upon finding the condition.
      }
    }
  }
  // If the loop completes without finding any digit appearing more than twice,
  // then the condition is not met.
  console.log('No'); // Output the negative result.
}

// Read the entire content from standard input as a UTF-8 string and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
