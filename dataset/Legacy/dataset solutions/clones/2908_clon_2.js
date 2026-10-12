const ProcessInput = (rawData) => {
  // Split the entire input string into individual lines
  const lineSegments = rawData.split('\n');

  // The first line often contains a count, but it's not used in this logic.
  const firstLineValue = lineSegments[0];

  // Process the remaining lines to extract restaurant data and assign original indices.
  // Each entry will be [original_index, restaurant_name, score_value].
  const restaurantEntries = lineSegments
    .filter((currentElement, elementIndex) => !!elementIndex) // Skip the first line
    .map((dataRow, rowIndex) => {
      // Split each data row by space to get name and score
      const parts = dataRow.split(' ');
      // Prepend the 1-based original index to the parts
      return [rowIndex + 1].concat(parts);
    });

  // Sort the collected restaurant entries using a custom comparison function.
  const orderedEntries = restaurantEntries.sort(entryComparator);

  // Iterate through the sorted entries and print the original index for valid ones.
  orderedEntries.forEach((itemEntry, itemIndex) => {
    // Check if the restaurant name (second element) is not empty.
    if (itemEntry[1] !== '') {
      console.log(itemEntry[0]); // Output the original 1-based index.
    }
  });
};

// This function compares two restaurant entries primarily by name, then by score.
const entryComparator = (firstEntry, secondEntry) => {
    // Extract restaurant names from the second position of each entry.
    const firstName = firstEntry[1];
    const secondName = secondEntry[1];

    // Compare names alphabetically.
    // If names are identical, use the score comparator.
    // Otherwise, sort by name in ascending order.
    return firstName === secondName
        ? scoreComparator(firstEntry, secondEntry)
        : firstName < secondName
            ? -1 // firstEntry comes before secondEntry
            : 1;  // firstEntry comes after secondEntry
};

// This function compares two restaurant entries by their scores in descending order.
const scoreComparator = (firstScoreEntry, secondScoreEntry) => {
    // Parse scores as integers from the third position of each entry.
    const firstScoreValue = parseInt(firstScoreEntry[2], 10);
    const secondScoreValue = parseInt(secondScoreEntry[2], 10);

    // Compare scores.
    // If scores are equal, their relative order doesn't change.
    // If firstScoreValue is less than secondScoreValue, secondScoreEntry comes first (descending).
    // Otherwise, firstScoreValue is greater, so firstScoreEntry comes first.
    return firstScoreValue === secondScoreValue
        ? 0
        : firstScoreValue < secondScoreValue
            ? 1  // firstScoreEntry comes after secondScoreEntry (lower score)
            : -1; // firstScoreEntry comes before secondScoreEntry (higher score)
};

// Execute the main processing function by reading input from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
