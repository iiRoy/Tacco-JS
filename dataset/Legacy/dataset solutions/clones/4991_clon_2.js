function ProcessInput(rawData) {
  // Split the raw input string into an array of lines
  let parsedLines = rawData.split("\n");

  // Parse the first line as the total quantity
  let totalUnits = parseInt(parsedLines[0], 10);
  // Parse the second line as the initial quantity for the first tier
  let initialUnits = parseInt(parsedLines[1], 10);
  // Parse the third line as the billing rate for the first tier
  let rateFirstTier = parseInt(parsedLines[2], 10);
  // Parse the fourth line as the billing rate for units beyond the first tier
  let rateAfterFirstTier = parseInt(parsedLines[3], 10);

  // Calculate the total cost based on the two-tier billing structure
  // Cost for the initial units + Cost for the remaining units
  console.log((initialUnits * rateFirstTier) + ((totalUnits - initialUnits) * rateAfterFirstTier));
}

// Read input from standard input and pass it to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
