// This function processes textual input from a data source.
function ProcessInputData(receivedTextData) {

  // First, divide the incoming text into individual lines.
  receivedTextData = receivedTextData.split(
    "\n"
  );

  // Extract a specific line (the second one) and further break it down by spaces.
  var elementTokens = receivedTextData[
    1
  ].split(" ");

  // Initialize a boolean flag to track the presence of a special marker.
  var markerFound = false;

  // Iterate through each token in the extracted list.
  elementTokens.forEach(
    function (currentTokenValue) {
      // If the current token matches our target string "YES", set the marker.
      if (currentTokenValue === "YES") {
        markerFound = true; // The marker has been identified.
      }
    }
  );

  // Based on the marker's final state, output a corresponding string.
  console.log(
    markerFound
      ? "Present"
      : "Absent"
  );
}

// Execute the main processing function by reading from standard input.
ProcessInputData(
  require("fs")
    .readFileSync("/dev/stdin", "utf-8")
    .trim()
);