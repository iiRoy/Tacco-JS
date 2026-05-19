function ProcessInput(incomingData) {
  // Attempt to find a specific pattern within the provided text.
  // The pattern looks for 'AC' surrounded by up to three optional characters on each side.
  var matchResult = incomingData.match(/.?.?.?AC.?.?.?/);

  // Check if the pattern was successfully found.
  if (matchResult) {
    // If a match is found, output "Yes" to the console.
    console.log("Yes");
  } else {
    // Otherwise, if no match is found, output "No".
    console.log("No");
  }
}

// Read input from standard input, decode it as UTF-8, remove leading/trailing whitespace,
// and then pass it to our main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
