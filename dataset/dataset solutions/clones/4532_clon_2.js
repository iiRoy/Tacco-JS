function ProcessInput(rawData) {
  // The input string is first split into an array of lines.
  let linesOfData = rawData.split("\n");

  // The second line of input contains space-separated score values.
  let scoreStrings = linesOfData[1].split(" ");

  // An array to keep track of occurrences for different score categories.
  // There are 8 standard categories and one special category for high scores.
  const categoryCounts = [];
  for (let k = 0; k < 0o11; k++) { // Initialize 9 elements (0o11 is octal for 9)
    categoryCounts[k] = 0; // Set initial count for each category to zero.
  }

  // Iterate through each score string to determine its category.
  for (let k = 0; k < scoreStrings.length; k++) {
    // Convert the current score string into an integer using base 10.
    let currentScore = parseInt(scoreStrings[k], 0xA); // 0xA is hexadecimal for 10

    // Assign the score to its respective category.
    // For the first 8 categories, we just mark if at least one score falls into it.
    if (currentScore >= 0 && currentScore < 400) {
      categoryCounts[0] = 1;
    } else if (currentScore >= 400 && currentScore < 800) {
      categoryCounts[1] = 1;
    } else if (currentScore >= 800 && currentScore < 1200) {
      categoryCounts[2] = 1;
    } else if (currentScore >= 1200 && currentScore < 1600) {
      categoryCounts[3] = 1;
    } else if (currentScore >= 1600 && currentScore < 2000) {
      categoryCounts[4] = 1;
    } else if (currentScore >= 2000 && currentScore < 2400) {
      categoryCounts[5] = 1;
    } else if (currentScore >= 2400 && currentScore < 2800) {
      categoryCounts[6] = 1;
    } else if (currentScore >= 2800 && currentScore < 3200) {
      categoryCounts[7] = 1;
    } else if (currentScore >= 3200 && currentScore <= 4800) {
      // For the highest score range, we count the actual number of scores.
      categoryCounts[8]++;
    }
  }

  // Sum up the distinct counts for the first 8 categories.
  let distinctLowerCategories = 0;
  for (let k = 0; k < 0o10; k++) { // Loop for 8 iterations (0o10 is octal for 8)
    distinctLowerCategories += categoryCounts[k];
  }

  // Calculate the maximum possible number of categories.
  // This includes the distinct lower categories plus the count from the special high-score category.
  let maxCategories = distinctLowerCategories + categoryCounts[8];
  if (maxCategories > 0o10) { // If the total exceeds 8, cap it at 8.
    maxCategories = 0o10;
  }

  // The minimum number of categories is simply the count of distinct lower categories.
  let minCategories = distinctLowerCategories;

  // Output the calculated minimum and maximum category counts.
  console.log('%d %d', minCategories, maxCategories);
}

// This line handles reading input from standard input and invoking the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
