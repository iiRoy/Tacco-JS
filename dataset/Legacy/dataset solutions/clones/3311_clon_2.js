function ProcessInput(rawData) {
  // Process the raw input string: trim, split by newlines, then split each line by spaces.
  rawData = rawData.trim().split("\n").map(function(lineContent) {
    return lineContent.split(" ");
  });

  // Extract the first string and convert it into an array of characters.
  let firstSequence = rawData[0][0].split("");
  // Extract the second string and convert it into an array of characters.
  let secondSequence = rawData[1][0].split("");

  // Initialize a 2D array for dynamic programming, representing the LCS table.
  var lcsTable = [];

  // Populate the first column of the DP table with zeros.
  // The number of rows corresponds to the length of the second sequence plus one.
  for (var rowIdx = 0; rowIdx <= secondSequence.length; rowIdx++) {
    lcsTable.push([]); // Add a new row
    lcsTable[rowIdx][0] = 0; // Set the first element of the new row to zero
  }

  // Populate the first row of the DP table with zeros.
  // The number of columns corresponds to the length of the first sequence plus one.
  for (var colIdx = 0; colIdx <= firstSequence.length; colIdx++) {
    lcsTable[0][colIdx] = 0;
  }

  // Fill the DP table using the standard LCS algorithm.
  // Iterate through each character of the second sequence.
  for (var rowIdx = 0; rowIdx < secondSequence.length; rowIdx++) {
    // Iterate through each character of the first sequence.
    for (var colIdx = 0; colIdx < firstSequence.length; colIdx++) {
      // If characters match, increment the diagonal value.
      if (firstSequence[colIdx] === secondSequence[rowIdx]) {
        lcsTable[rowIdx + 1][colIdx + 1] = lcsTable[rowIdx][colIdx] + 1;
      }
      // If characters do not match, take the maximum from the cell above or to the left.
      else {
        lcsTable[rowIdx + 1][colIdx + 1] = Math.max(lcsTable[rowIdx + 1][colIdx], lcsTable[rowIdx][colIdx + 1]);
      }
    }
  }

  // The length of the Longest Common Subsequence is found at the bottom-right corner of the DP table.
  let lcsLength = lcsTable[secondSequence.length][firstSequence.length];

  // Variables to track current positions during LCS reconstruction.
  let currentTextIndex = secondSequence.length; // Corresponds to row index in DP table
  let currentPatternIndex = firstSequence.length; // Corresponds to column index in DP table
  let matchedChar; // Stores the character identified as part of the LCS
  let resultChars = []; // Array to store the characters of the LCS in reverse order

  // Reconstruct the LCS by backtracking through the DP table.
  // We iterate 'lcsLength' times, as we expect to find 'lcsLength' characters.
  for (let k = 0; k < lcsLength; k++) {
    // Find the column index where the value in the current row decreased,
    // indicating that the character at `firstSequence[currentPatternIndex - 1]` was part of the LCS.
    for (let p = currentPatternIndex; p >= 1; p--) {
      if (lcsTable[currentTextIndex][p] > lcsTable[currentTextIndex][p - 1]) {
        currentPatternIndex = p - 1; // Move to the column of the matched character
        break;
      }
    }

    // Store the character from the first sequence.
    matchedChar = firstSequence[currentPatternIndex];

    // Find the row index where the character from the second sequence matches `matchedChar`,
    // indicating that `secondSequence[currentTextIndex - 1]` was also part of the LCS.
    for (let q = currentTextIndex; q >= 1; q--) {
      if (secondSequence[q - 1] === matchedChar) {
        resultChars.push(matchedChar); // Add the character to our result list
        currentTextIndex = q - 1; // Move to the row of the matched character
        break;
      }
    }
  }

  // The characters were collected in reverse order, so reverse the array and join them to form the final string.
  console.log(resultChars.reverse().join(""));
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
