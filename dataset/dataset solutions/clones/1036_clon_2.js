function ProcessInput(rawData) {
  // This function processes the given raw data to find common elements.
  rawData = rawData.split("\n"); // Divide the input string into lines.

  let firstCount = parseInt(rawData[0], 10); // Extract the first numerical parameter from the first line.
  let secondCount = parseInt(rawData[2], 10); // Extract the second numerical parameter from the third line.

  rawData[1] = rawData[1].split(" "); // Split the second line into individual string elements.
  rawData[3] = rawData[3].split(" "); // Split the fourth line into individual string elements.

  const firstList = new Array(firstCount); // Initialize an array for the first set of numbers.
  const secondList = new Array(secondCount); // Initialize an array for the second set of numbers.

  // Populate the first list with parsed integers.
  for (let idxA = 0; idxA < firstCount; idxA++) {
    firstList[idxA] = parseInt(rawData[1][idxA], 10);
  }

  // Populate the second list with parsed integers.
  for (let idxB = 0; idxB < secondCount; idxB++) {
    secondList[idxB] = parseInt(rawData[3][idxB], 10);
  }

  let matchTally = 0; // Initialize a counter for matching elements.

  // Iterate through both lists to find common elements.
  for (let idxA = 0; idxA < firstCount; idxA++) {
    for (let idxB = 0; idxB < secondCount; idxB++) {
      // Increment the tally if elements are strictly equal.
      matchTally += (firstList[idxA] === secondList[idxB]);
    }
  }

  console.log(matchTally); // Display the final count of matches.
}

// Execute the main processing function with file system input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
