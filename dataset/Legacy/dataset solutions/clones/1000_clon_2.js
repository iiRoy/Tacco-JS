const computeMaxDifference = dataArray => {
  let idx = 1;
  let currentMaxDiff = -Infinity;
  let currentMinVal = Infinity;

  // Iterate through the array to find the maximum difference
  // between an element and the minimum element encountered so far.
  for (idx = 1; idx < dataArray[0]; idx++) {
    currentMaxDiff = Math.max(currentMaxDiff, dataArray[idx] - currentMinVal);
    console.log(`maxv: ${currentMaxDiff}`);
    console.log(`min: ${currentMinVal}`);
    console.log(`arr[j]: ${dataArray[idx]}`);
    currentMinVal = Math.min(currentMinVal, dataArray[idx]);
    console.log(``); // Empty line for separation
  }

  // Output the final maximum difference
  console.log(currentMaxDiff);
};

// Standard input processing setup
process.stdin.resume();
process.stdin.setEncoding("utf8");

let receivedInput = "";

// Accumulate data from standard input
process.stdin.on("data", chunk => {
  receivedInput += chunk;
});

// Process input once all data has been received
process.stdin.on("end", () => {
  // Split input into lines and filter out empty ones
  const parsedLines = receivedInput.split("\n").filter(element => {
    return element !== "";
  });
  // Call the main function with the processed lines
  computeMaxDifference(parsedLines);
});
