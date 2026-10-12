// Entire input data is passed to the function
function ProcessInput(rawData) {
  // The first line is rawData[0], second is rawData[1], etc.
  let targetValue = rawData;
  let currentAmount = 100;
  let elapsedYears = 0;

  while (currentAmount < targetValue) {
    currentAmount = Math.floor(currentAmount * 1.01);
    elapsedYears = elapsedYears + 1;
  }

  // Display result
  console.log(elapsedYears);
}

// Do not modify below this line (reads from stdin and calls the primary function)
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
