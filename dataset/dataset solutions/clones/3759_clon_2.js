const processInputData = function (rawData) {
  // Split the raw input string into individual lines
  let processedLines = rawData.split(String.fromCharCode(10));

  // Parse the first line to get N and M values
  const firstLineValues = processedLines[0].split(String.fromCharCode(32)).map(valStr => parseInt(valStr, 10));

  // Extract the number of entries (N) and the count for top scores (M)
  const numEntries = firstLineValues[0];
  const topCount = firstLineValues[1];

  // Variable to hold the sum of three numbers for each entry
  let currentTotal;

  // Array to store the absolute sums of each entry
  const calculatedScores = [];

  // Loop through each entry from the second line onwards
  for (let idx = 0x1; idx <= numEntries; idx++) {
    // Parse the current line into an array of integers
    processedLines[idx] = processedLines[idx].split(String.fromCharCode(32)).map(valStr => parseInt(valStr, 10));

    // Calculate the sum of the three numbers in the current entry
    currentTotal = processedLines[idx][0] + processedLines[idx][1] + processedLines[idx][2];

    // Ensure the sum is a positive value (absolute value)
    if (currentTotal < 0x0) {
      currentTotal = -currentTotal;
    }

    // Add the calculated absolute sum to our scores array
    calculatedScores.push(currentTotal);
  }

  // Sort the scores in descending order
  calculatedScores.sort(function (scoreA, scoreB) {
    return scoreB - scoreA;
  });

  // Initialize a variable to accumulate the sum of the top M scores
  let finalSum = 0x0;

  // Sum the top M scores from the sorted array
  for (let idx = 0x0; idx < topCount; idx++) {
    finalSum = finalSum + calculatedScores[idx];
  }

  // Output the final accumulated sum to the console
  console.log(finalSum);

  // Indicate successful execution
  return 0x0;
};

// Read input from standard input, decode as UTF-8, and remove leading/trailing whitespace
processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
