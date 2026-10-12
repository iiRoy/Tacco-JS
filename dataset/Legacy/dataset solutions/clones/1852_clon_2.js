function ProcessInput(rawData) {
  // The raw input string is split into an array of lines.
  rawData = rawData.split("\n");

  // The first line is parsed as an integer to determine the maximum allowed length.
  const maxLen = Number.parseInt(rawData[0]);

  // The second line is taken as the primary text string.
  const textString = rawData[1];

  // A conditional check determines if the string's length exceeds the maximum.
  if (textString.length <= maxLen) {
    // If the string is short enough, it's printed directly to the console.
    console.log(textString);
  } else {
    // Otherwise, the string is truncated to the maximum length, and an ellipsis is appended.
    console.log(textString.slice(0, maxLen) + '...');
  }
}

// This is a supplementary function intended for local testing within a browser environment.
function testFunction() {
  // It retrieves input data from a specific HTML element.
  var testData = document.getElementById("input").value;
  // The main processing logic is then invoked with this test data.
  ProcessInput(testData);
}

// The following line is crucial for the application's execution in a Node.js environment
// and should not be altered. It reads the entire content from standard input and passes it
// to the primary processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
