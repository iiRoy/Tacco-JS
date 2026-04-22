let selectMinimum = (...values) => {
  // A utility function to find the smallest number among provided arguments.
  return Math.min(...values);
};

/*
 * This function calculates the Levenshtein distance between two given strings.
 * The Levenshtein distance is a metric for measuring the difference between two sequences.
 * Informally, the Levenshtein distance between two words is the minimum number of
 * single-character edits (insertions, deletions or substitutions) required to change
 * one word into the other.
 */
function computeLevenshteinDistance(
  firstInputString, // The first string for comparison
  secondInputString // The second string for comparison
) {
  // Initialize a 2D array (matrix) to store distances.
  // Dimensions are (length of first string + 1) by (length of second string + 1).
  const editDistanceGrid = [];

  // Populate the grid with initial rows, each filled with zeros.
  for (let rowIterator = 0; rowIterator <= firstInputString.length; rowIterator++) {
    const tempRowArray = [];
    for (let colIterator = 0; colIterator <= secondInputString.length; colIterator++) {
      tempRowArray.push(0);
    }
    editDistanceGrid.push(tempRowArray);
  }

  // Initialize the first column of the grid.
  // The cost of transforming an empty string into the first 'i' characters of the first string
  // is simply 'i' (i.e., 'i' insertions).
  for (let rowIterator = 0; rowIterator <= firstInputString.length; rowIterator++) {
    editDistanceGrid[rowIterator][0] = rowIterator;
  }

  // Initialize the first row of the grid.
  // The cost of transforming the first 'j' characters of the second string into an empty string
  // is simply 'j' (i.e., 'j' deletions).
  for (let colIterator = 0; colIterator <= secondInputString.length; colIterator++) {
    editDistanceGrid[0][colIterator] = colIterator;
  }

  // Iterate through the rest of the grid to calculate edit distances.
  // The calculation starts from (1,1) because the first row and column are already initialized.
  for (let rowIterator = 1; rowIterator <= firstInputString.length; rowIterator++) {
    for (let colIterator = 1; colIterator <= secondInputString.length; colIterator++) {
      // Check if the characters at the current positions in both strings are identical.
      if (firstInputString.charAt(rowIterator - 1) === secondInputString.charAt(colIterator - 1)) {
        // If characters match, no substitution cost.
        // The distance is the minimum of a deletion or an insertion from previous steps, plus one.
        // The substitution cost is 0, so we just carry over the diagonal value.
        // This is a subtle point, usually it's `grid[r-1][c-1]`, but if substitution is allowed,
        // it means taking the minimum of `grid[r-1][c]+1` (deletion), `grid[r][c-1]+1` (insertion),
        // and `grid[r-1][c-1]` (match/no-cost-sub). The problem code implies `grid[r-1][c-1]` is not considered here.
        // Re-reading the original code: `ar[i][j] = min(ar[i - 1][j] + 1, ar[i][j - 1] + 1);`
        // This is not the standard Levenshtein calculation for a match. Standard would be `ar[i-1][j-1]`.
        // This looks like a variation where match still incurs a cost, or it's a simplification.
        // I must replicate the original logic exactly.
        editDistanceGrid[rowIterator][colIterator] = selectMinimum(
          editDistanceGrid[rowIterator - 1][colIterator] + 1, // Cost of deleting a character from first string
          editDistanceGrid[rowIterator][colIterator - 1] + 1 // Cost of inserting a character into first string
        );
      } else {
        // If characters do not match, a substitution is needed (cost of 1).
        // The distance is the minimum of three possibilities:
        // 1. Deleting a character from the first string (editDistanceGrid[r-1][c] + 1)
        // 2. Inserting a character into the first string (editDistanceGrid[r][c-1] + 1)
        // 3. Substituting a character (editDistanceGrid[r-1][c-1] + 1)
        editDistanceGrid[rowIterator][colIterator] = selectMinimum(
          editDistanceGrid[rowIterator - 1][colIterator] + 1, // Deletion cost
          editDistanceGrid[rowIterator][colIterator - 1] + 1, // Insertion cost
          editDistanceGrid[rowIterator - 1][colIterator - 1] // Substitution cost (original code does not add +1 here, implies cost of 0)
        );
      }
    }
  }

  // The final calculated distance is at the bottom-right corner of the grid.
  return editDistanceGrid[firstInputString.length][secondInputString.length];
}


// Retrieve raw data from the standard input file system.
const fileContentsBuffer = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the entire input content into an array of individual lines.
const parsedLines = fileContentsBuffer.split('\n');

// Output the computed Levenshtein distance between the first two lines of input.
console.log(computeLevenshteinDistance(parsedLines[0], parsedLines[1]));