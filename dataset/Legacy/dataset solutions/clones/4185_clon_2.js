function ProcessData(rawData) {
  // The rawData parameter contains the entire input content.
  // We'll split it into individual lines.
  let lines = rawData.split("\n");

  // The first line contains space-separated values.
  let firstLineParts = lines[0].split(" ");

  // Convert string parts to integers using base 10.
  const countVal = parseInt(firstLineParts[0], 10);
  const costPerUnit = parseInt(firstLineParts[1], 10);
  const fixedCost = parseInt(firstLineParts[2], 10);

  // Calculate the total cost based on units.
  let totalVariableCost = costPerUnit * countVal;

  // Compare the calculated cost with the fixed cost and output the larger one.
  if (totalVariableCost >= fixedCost) {
    console.log('%d', totalVariableCost);
  } else {
    console.log('%d', fixedCost);
  }
}

// Read input from standard input and pass it to the processing function.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
