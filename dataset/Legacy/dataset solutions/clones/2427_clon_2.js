function ProcessInput(rawData) {
  // Process the raw input string by splitting it into lines.
  rawData = rawData.split('\n');

  // Extract the first line of input.
  const firstLine = rawData[0];

  // Extract the second line of input.
  const secondLine = rawData[1];

  // Initialize a boolean variable to control a conditional block.
  let conditionMet = true;

  // Check if the condition is met.
  if (conditionMet) {
    // If the condition is true, print a specific message to the console.
    console.log("Yes");
  }
}

// Read the content from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
