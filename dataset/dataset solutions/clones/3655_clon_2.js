function processInput(rawData) {
  // Remove any leading or trailing whitespace from the raw input string.
  rawData = rawData.trim();

  // Split the cleaned input into an array of lines using the newline character.
  // The first line is assigned to 'firstLine'.
  var firstLine = rawData.split("\n")[0];
  // The second line is assigned to 'secondLine'.
  var secondLine = rawData.split("\n")[1];

  // Initialize a counter to track the number of character mismatches.
  var mismatchCount = 0;

  // Iterate through each character of the 'firstLine' string.
  for (var idx = 0; idx < firstLine.length; idx++) {
    // Compare the character at the current index 'idx' in 'firstLine'
    // with the character at the corresponding reverse index in 'secondLine'.
    // Note: The original code accesses 'charAt' as an array property, which is preserved.
    if (firstLine.charAt[idx] == secondLine.charAt[firstLine.length - 1 - idx]) {
      // If the characters match, no action is needed.
    } else {
      // If the characters do not match, increment the mismatch counter.
      mismatchCount++;
    }
  }

  // After checking all characters, determine the final output.
  if (mismatchCount == 0) {
    // If no mismatches were found, print "Yes".
    console.log("Yes");
  } else {
    // If one or more mismatches were found, print "No".
    console.log("No");
  }
}

// Read the entire content of standard input synchronously using Node.js 'fs' module,
// decode it as UTF-8, and then pass it to the 'processInput' function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
