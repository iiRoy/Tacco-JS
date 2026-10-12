function ProcessInput(rawData) {
  // Split the entire input string by newline characters to get individual lines.
  let linesOfData = rawData.split("\n");

  // Parse the first line to get the total number of items and the number of queries.
  const [totalItems, queryCount] = linesOfData[0].split(" ").map(strVal => parseInt(strVal, 10));

  // The second line contains the colors of the items, split by spaces.
  const itemColors = linesOfData[1].split(" ");

  // Iterate through each query.
  for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
    // For each query, parse its start and end indices from the corresponding line.
    // Queries start from line index 2 (0-indexed).
    const [rangeStart, rangeEnd] = linesOfData[queryIndex + 2].split(" ").map(strVal => parseInt(strVal, 10));

    // Initialize an array to store unique colors found in the current query range.
    let uniqueColorsInQuery = [];

    // Loop through the items within the specified range (adjusting for 0-based indexing).
    for (let itemIndex = rangeStart - 1; itemIndex < rangeEnd; itemIndex++) {
      // Get the color of the current item.
      const currentItemColor = itemColors[itemIndex];

      // Check if this color is already in our unique list.
      if (uniqueColorsInQuery.indexOf(currentItemColor) === -1) {
        // If not, add it to the list.
        uniqueColorsInQuery.push(currentItemColor);
      }
    }
    // Output the count of unique colors for the current query.
    console.log(uniqueColorsInQuery.length);
  }
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
