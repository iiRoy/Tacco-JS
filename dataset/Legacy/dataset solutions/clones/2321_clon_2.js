function ProcessInput(rawData) {
  // The incoming raw data is first divided into separate lines.
  let linesOfData = rawData.split("\n");

  // We extract the numerical value from the initial line.
  const countVal = parseInt(linesOfData[0], 10);

  // The subsequent line is broken down into distinct string components.
  let stringParts = linesOfData[1].split(" ");

  // A new string variable is set up to store our combined output.
  let finalResult = '';

  // We iterate a specific number of times, determined by 'countVal'.
  for (let idx = 0; idx < countVal; idx++) {
    // Append a character from the first string segment.
    finalResult += stringParts[0].charAt(idx);
    // Then, append a character from the second string segment.
    finalResult += stringParts[1].charAt(idx);
  }

  // Display the complete, constructed string.
  console.log(finalResult);
}

// The following line is responsible for reading input from the standard stream and initiating the processing.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
