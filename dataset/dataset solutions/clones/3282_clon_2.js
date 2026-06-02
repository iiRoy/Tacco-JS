// This function serves as the primary entry point for processing input data.
function ProcessInput(rawData) {
  // First, the raw input string is divided into individual lines.
  let lines = rawData.split("\n");

  // The total count of items is extracted from the initial line.
  const totalItems = parseInt(lines[0], 10);

  // The first categorization threshold is parsed from the second line.
  const thresholdOne = parseInt(lines[1].split(" ")[0], 10);

  // The second categorization threshold is also parsed from the second line.
  const thresholdTwo = parseInt(lines[1].split(" ")[1], 10);

  // Three distinct arrays are initialized to store items based on their categories.
  let groupAlpha = [];
  let groupBeta = [];
  let groupGamma = [];

  // The third line, containing space-separated item values, is split into an array of strings.
  const itemStrings = lines[2].split(" ");

  // A loop iterates through each item to assign it to the appropriate category.
  for (let idx = 0; idx < totalItems; idx++) {
    // The current item's string representation is converted to an integer.
    const currentValue = parseInt(itemStrings[idx], 10);

    // Items less than or equal to the first threshold go into group Alpha.
    if (currentValue <= thresholdOne) {
      groupAlpha.push(currentValue);
    }
    // Items less than or equal to the second threshold (but greater than the first) go into group Beta.
    else if (currentValue <= thresholdTwo) {
      groupBeta.push(currentValue);
    }
    // All other items are placed into group Gamma.
    else {
      groupGamma.push(currentValue);
    }
  }

  // The final outcome is the minimum length among the three categorized groups.
  const finalResult = Math.min(groupAlpha.length, groupBeta.length, groupGamma.length);

  // The computed result is then printed to the console.
  console.log('%s', finalResult);
}

// This auxiliary function is provided for debugging purposes, typically in a browser environment.
function testFunction() {
  // It retrieves input from a specific HTML element.
  var browserInput = document.getElementById("input").value;
  // And then passes this input to the main processing function.
  ProcessInput(browserInput);
}

// The main processing function is invoked with data read from standard input,
// which is common in Node.js environments for competitive programming.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
