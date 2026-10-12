function areFirstThreeCharsIdentical(segmentArray) {
  const firstChar = segmentArray[0];
  const secondChar = segmentArray[1];
  const thirdChar = segmentArray[2];

  // Ensure all three characters are strictly equal
  return firstChar === secondChar && secondChar === thirdChar;
}

function processInputData(sourceData) {
  // Split the entire input string into an array of individual characters
  const characterSegments = sourceData.split("");

  // Determine if the initial three characters are identical using a helper function
  const initialCharsAreUniform = areFirstThreeCharsIdentical(characterSegments);

  // Based on the uniformity check, prepare the appropriate output message
  const outputMessage = initialCharsAreUniform ? "No" : "Yes";

  // Display the determined message to the console
  console.log(outputMessage);
}

// Read input from standard input and pass it to the processing function
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
