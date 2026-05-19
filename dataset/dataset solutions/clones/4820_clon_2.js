function ProcessInput(rawData) {
  // Remove leading/trailing whitespace from the raw input string.
  rawData = rawData.trim();

  // Attempt to find any lowercase vowel within the processed string.
  var matchResult = rawData.match("[aiueo]");

  // Check if a vowel was successfully found.
  if (matchResult) {
    // If a match exists, print "vowel" to the console.
    console.log("vowel");
  } else {
    // Otherwise, if no vowel was found, print "consonant".
    console.log("consonant");
  }
}

// Read the entire content from standard input, decode it as UTF-8,
// and then pass it to our primary processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
