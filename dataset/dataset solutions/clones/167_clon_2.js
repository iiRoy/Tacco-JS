var arrangements = []; // Stores all 4-element permutations
var usedIndices = []; // Tracks which indices (0-3) have been used in a permutation

// Initialize usage flags for each position
for (var firstPos = 0; firstPos < 4; firstPos++) {
  usedIndices[firstPos] = false;
}

var permutationCount = 0; // Counter for generated permutations

// Generate all permutations of 4 distinct numbers (0-3)
for (var firstIdx = 0; firstIdx < 4; firstIdx++) {
  usedIndices[firstIdx] = true; // Mark first index as used

  for (var secondIdx = 0; secondIdx < 4; secondIdx++) {
    if (usedIndices[secondIdx]) {
      continue; // Skip if already used
    }
    usedIndices[secondIdx] = true; // Mark second index as used

    for (var thirdIdx = 0; thirdIdx < 4; thirdIdx++) {
      if (usedIndices[thirdIdx]) {
        continue; // Skip if already used
      }
      usedIndices[thirdIdx] = true; // Mark third index as used

      for (var fourthIdx = 0; fourthIdx < 4; fourthIdx++) {
        if (usedIndices[fourthIdx]) {
          continue; // Skip if already used, ensures all 4 are unique
        }

        // Store the current unique permutation
        arrangements[permutationCount] = [firstIdx, secondIdx, thirdIdx, fourthIdx];
        permutationCount++; // Increment the counter
      }
      usedIndices[thirdIdx] = false; // Backtrack: Unmark third index
    }
    usedIndices[secondIdx] = false; // Backtrack: Unmark second index
  }
  usedIndices[firstIdx] = false; // Backtrack: Unmark first index
}

// Read input data from standard input
var rawData = require('node:fs').readFileSync('/dev/stdin', 'utf8');

var inputLines = (rawData.trim()).split("\n"); // Split input into individual lines

// Process each line of input until a termination condition is met
while (true) {
  var currentLineData = inputLines.shift(); // Get the next line

  // Check for the termination sequence
  if (currentLineData === "0 0 0 0") {
    break;
  }

  // Parse the numbers from the current line
  var numberSequence = currentLineData.split(" ").map(parseInt);
  var resultExpression = 0; // Initialize the expression result (0 means not found yet)

  var operatorSymbols = ["+", "-", "*"]; // Available arithmetic operators

  // Iterate through all possible combinations of three operators
  for (var op1Index = 0; op1Index < 3; op1Index++) {
    for (var op2Index = 0; op2Index < 3; op2Index++) {
      for (var op3Index = 0; op3Index < 3; op3Index++) {

        // For each operator combination, try all number permutations
        arrangements.forEach(function (currentPermutation) {
          var valA = numberSequence[currentPermutation[0]];
          var valB = numberSequence[currentPermutation[1]];
          var valC = numberSequence[currentPermutation[2]];
          var valD = numberSequence[currentPermutation[3]];

          // Test various parenthesizations to achieve a target value of 10
          if (resultExpression === 0 && eval(valA + operatorSymbols[op1Index] + valB + operatorSymbols[op2Index] + valC + operatorSymbols[op3Index] + valD) === 10) {
            resultExpression = valA + operatorSymbols[op1Index] + valB + operatorSymbols[op2Index] + valC + operatorSymbols[op3Index] + valD;
          }
          if (resultExpression === 0 && eval("(" + valA + operatorSymbols[op1Index] + valB + operatorSymbols[op2Index] + valC + ")" + operatorSymbols[op3Index] + valD) === 10) {
            resultExpression = "(" + valA + operatorSymbols[op1Index] + valB + operatorSymbols[op2Index] + valC + ")" + operatorSymbols[op3Index] + valD;
          }
          if (resultExpression === 0 && eval("(" + valA + operatorSymbols[op1Index] + valB + ")" + operatorSymbols[op2Index] + "(" + valC + operatorSymbols[op3Index] + valD + ")") === 10) {
            resultExpression = "(" + valA + operatorSymbols[op1Index] + valB + ")" + operatorSymbols[op2Index] + "(" + valC + operatorSymbols[op3Index] + valD + ")";
          }
          if (resultExpression === 0 && eval("(" + "(" + valA + operatorSymbols[op1Index] + valB + ")" + operatorSymbols[op2Index] + valC + ")" + operatorSymbols[op3Index] + valD) === 10) {
            resultExpression = "(" + "(" + valA + operatorSymbols[op1Index] + valB + ")" + operatorSymbols[op2Index] + valC + ")" + operatorSymbols[op3Index] + valD;
          }
          if (resultExpression === 0 && eval(valA + operatorSymbols[op1Index] + "(" + valB + operatorSymbols[op2Index] + valC + operatorSymbols[op3Index] + valD + ")") === 10) {
            resultExpression = valA + operatorSymbols[op1Index] + "(" + valB + operatorSymbols[op2Index] + valC + operatorSymbols[op3Index] + valD + ")";
          }
        });
      }
    }
  }

  // Format and output the found expression or '0'
  if (resultExpression !== 0) {
    resultExpression = "(" + resultExpression + ")"; // Wrap the result if found
  }
  console.log(resultExpression); // Print the outcome
}