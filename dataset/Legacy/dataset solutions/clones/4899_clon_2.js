function analyzeSequence(rawInputData) {
  // Split the raw input data into an array of lines.
  var inputLines = rawInputData.split("\n");

  // The first line of input is our target sequence.
  var targetSequence = inputLines[0];

  // Variables to store the indices of 'C' and 'F'.
  var firstCharCIndex;
  var lastCharFIndex;

  // Iterate through the sequence from the beginning to find the first 'C'.
  for (var charIndex = 0; charIndex < targetSequence.length; charIndex++) {
    if (targetSequence[charIndex] === "C") {
      firstCharCIndex = charIndex;
      break; // Stop after finding the first 'C'.
    }
  }

  // Iterate through the sequence from the end to find the last 'F'.
  for (var reverseCharIndex = targetSequence.length - 1; reverseCharIndex >= 0; reverseCharIndex--) {
    if (targetSequence[reverseCharIndex] === "F") {
      lastCharFIndex = reverseCharIndex;
      break; // Stop after finding the last 'F'.
    }
  }

  // Compare the found indices to determine the output.
  if (firstCharCIndex < lastCharFIndex) {
    console.log("Yes");
  } else {
    console.log("No");
  }
}

// Read input from standard input and pass it to the analysis function.
analyzeSequence(require("fs").readFileSync("/dev/stdin", "utf8"));
