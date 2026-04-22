const ProcessInput = (rawData) => {
  // Split the raw input string into an array of lines
  const lineFragments = rawData.split('\n');

  // The first line often contains a count, though not used here directly
  const recordCount = lineFragments[0];

  // Process all subsequent lines to create structured data for restaurants
  const evaluatedEstablishments = lineFragments
    .filter((item, idx) => !!idx) // Skip the first line (recordCount)
    .map((dataRow, idx) => {
      // Each restaurant entry includes its original 1-based index and parsed data
      return [idx + 1].concat(dataRow.split(' '));
    });

  // Sort the establishments based on a custom comparison logic
  const orderedRecords = evaluatedEstablishments.sort(sortEntities);

  // Iterate through the sorted records and print the original index
  orderedRecords.forEach((element, index) => {
    // Only print if the name (second element) is not an empty string
    if (element[1] !== '') {
      console.log(element[0]);
    }
  });
};

// Comparison function for sorting restaurant entries
const sortEntities = (firstEntry, secondEntry) => {
    // Extract restaurant names for primary comparison
    const entryAName = firstEntry[1];
    const entryBName = secondEntry[1];

    // If names are identical, compare by score; otherwise, compare alphabetically by name
    return entryAName === entryBName
        ? compareScores(firstEntry, secondEntry)
        : entryAName < entryBName
            ? -1 // entryA comes before entryB
            : 1;  // entryA comes after entryB
};

// Secondary comparison function for scores (descending order)
const compareScores = (firstEntry, secondEntry) => {
    // Parse scores as integers for numerical comparison
    const firstScoreValue = Number.parseInt(firstEntry[2], 10);
    const secondScoreValue = Number.parseInt(secondEntry[2], 10);

    // Compare scores: higher score comes first
    return firstScoreValue === secondScoreValue
        ? 0  // Scores are equal
        : firstScoreValue < secondScoreValue
            ? 1  // firstEntry has lower score, comes after
            : -1; // firstEntry has higher score, comes before
};

// Execute the main processing function with data read from standard input
ProcessInput(require("node:fs").readFileSync("/dev/stdin", "utf8"));