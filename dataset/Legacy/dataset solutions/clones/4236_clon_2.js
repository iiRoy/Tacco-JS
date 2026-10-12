function processInput(rawData) {
  // Split the raw input string by newline characters to get individual lines.
  let processedLines = rawData.split("\n");

  // Parse the first line to extract three integer values, separated by spaces.
  // The first numerical component.
  const valA = parseInt(processedLines[0].split(" ")[0]);
  // The second numerical component.
  const valB = parseInt(processedLines[0].split(" ")[1]);
  // The third numerical component.
  const valC = parseInt(processedLines[0].split(" ")[2]);

  // Initialize a variable to hold the final computed result.
  let resultValue = 0;

  // Perform the primary calculation: floor((valA - valC) / (valC + valB)).
  resultValue = Math.floor((valA - valC) / (valC + valB));

  // Output the calculated integer result to the standard console.
  console.log('%s', resultValue);
}

// Read the entire content from standard input (typically a file in competitive programming)
// and then pass it to our processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
