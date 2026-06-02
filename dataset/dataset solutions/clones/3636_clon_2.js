// This script processes a numerical input to determine a competition type based on its value.
function ProcessData(rawData) {
  // Convert the raw string input into an integer for numerical comparisons.
  let ratingValue = Number.parseInt(rawData, 10);

  // Initialize the default competition type, assuming the highest category.
  let competitionType = 'AGC';

  // Evaluate the parsed rating to assign the appropriate competition category.
  if (ratingValue < 1200) {
    // If the rating is below 1200, it falls into the 'ABC' category.
    competitionType = 'ABC';
  } else if (ratingValue < 2800) {
    // If the rating is between 1200 and 2799, it's an 'ARC' competition.
    competitionType = 'ARC';
  }
  // For ratings 2800 and above, the competitionType remains 'AGC'.

  // Display the determined competition type to the standard output.
  console.log(competitionType);
}

// The following line is responsible for reading input from the standard input stream
// and passing it to the main data processing function. This part is critical for
// the script's execution environment and should remain unchanged.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
