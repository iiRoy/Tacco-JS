/*
 * This script processes a list of status codes from standard input.
 * It counts occurrences of "AC", "WA", "TLE", and "RE" statuses.
 * Finally, it prints the count for each status category.
 */

function processInputData(rawData) {
  // Remove any leading/trailing whitespace from the raw input string.
  let cleanedInput = rawData.trim();

  // Split the cleaned input into individual lines.
  // The first line is typically a count, subsequent lines are status codes.
  let linesOfText = cleanedInput.split("\n");

  // Define the expected status categories. These are fixed.
  const statusCategories = ["AC", "WA", "TLE", "RE"];

  // Initialize an array to store the counts for each category.
  // The order corresponds to the 'statusCategories' array.
  let categoryCounts = [0, 0, 0, 0];

  // Iterate through the lines of text, starting from the second line (index 1),
  // as the first line is usually a total count and not a status itself.
  for (let idx = 1; idx < linesOfText.length; idx++) {
    // Check the current line against each defined status category.
    if (linesOfText[idx] === statusCategories[0]) {
      categoryCounts[0]++; // Increment count for "AC"
    } else if (linesOfText[idx] === statusCategories[1]) {
      categoryCounts[1]++; // Increment count for "WA"
    } else if (linesOfText[idx] === statusCategories[2]) {
      categoryCounts[2]++; // Increment count for "TLE"
    } else if (linesOfText[idx] === statusCategories[3]) {
      categoryCounts[3]++; // Increment count for "RE"
    }
  }

  // Output the final counts for each status category.
  // The format will be "CATEGORY x COUNT".
  for (let counter = 0; counter < statusCategories.length; counter++) {
    console.log(statusCategories[counter] + " x " + categoryCounts[counter]);
  }
}

// Read the entire content from standard input, assuming UTF-8 encoding,
// and then pass it to our processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
