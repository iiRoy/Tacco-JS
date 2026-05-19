var inputData = [];

var numItems, targetOne, targetTwo, targetThree;
var itemLengths;
var minCost = Infinity;

// Import the standard input/output module for Node.js
var readline = require("readline");
var inputHandler = readline.createInterface({
  input:  process.stdin,
  output: process.stdout
});

// Event listener for each line of input received
inputHandler.on('line', function(lineContent){
  inputData.push(lineContent);
});

// Event listener for when the input stream closes
inputHandler.on('close', function(){
  // Process the first line to get N, A, B, C
  var firstLine = inputData.shift();
  var params = firstLine.split(" ");
  numItems = Number(params[0]);
  targetOne = Number(params[1]);
  targetTwo = Number(params[2]);
  targetThree = Number(params[3]);

  // Initialize the array to store individual item lengths
  itemLengths = Array(numItems);

  // Populate the itemLengths array from the remaining input lines
  for (var idx = 0; idx < numItems; idx++) {
    itemLengths[idx] = Number(inputData[idx]);
  }

  // Start the recursive exploration process
  exploreCombinations(0, []);
  // Output the final minimum calculated cost
  console.log(minCost);
});

/**
 * Recursively explores all possible assignments of bamboo pieces.
 * Each piece can be assigned to target A (0), B (1), C (2), or discarded (3).
 * @param {number} currentIdx - The current index of the bamboo piece being considered.
 * @param {number[]} assignmentMap - An array storing the assignment for each bamboo piece.
 */
function exploreCombinations(currentIdx, assignmentMap) {
    // Base case: if all bamboo pieces have been assigned
    if (currentIdx === numItems) {
        evaluateCost(assignmentMap); // Calculate cost for this complete assignment
        return 0; // Return value is not used, just to exit
    }

    // Recursive step: try all 4 assignment options for the current bamboo piece
    for (var option = 0; option < 4; option++) {
        assignmentMap[currentIdx] = option; // Assign the current piece to an option
        exploreCombinations(currentIdx + 1, assignmentMap); // Recurse for the next piece
    }
}

/**
 * Calculates the cost for a given assignment of bamboo pieces.
 * @param {number[]} assignmentMap - An array where each element indicates the target (0, 1, 2) or discard (3) for the corresponding bamboo piece.
 */
function evaluateCost(assignmentMap) {
    var currentLenOne = 0;
    var currentLenTwo = 0;
    var currentLenThree = 0;
    var countOne = 0;
    var countTwo = 0;
    var countThree = 0;

    // Iterate through all bamboo pieces to sum their lengths and count assignments
    for (var idx = 0; idx < numItems; idx++) {
        // Assigned to target A
        if (assignmentMap[idx] === 0) {
            if (itemLengths[idx] !== 0) { // Ensure length is not zero before adding
                currentLenOne = currentLenOne + itemLengths[idx];
                countOne++;
            }
        }
        // Assigned to target B
        else if (assignmentMap[idx] === 1) {
            if (itemLengths[idx] !== 0) {
                currentLenTwo = currentLenTwo + itemLengths[idx];
                countTwo++;
            }
        }
        // Assigned to target C
        else if (assignmentMap[idx] === 2) {
            if (itemLengths[idx] !== 0) {
                currentLenThree = currentLenThree + itemLengths[idx];
                countThree++;
            }
        }
        // Discarded (option 3) - no action needed
        else { /* This piece is not used for any target */ }
    }

    // Adjust counts for MP cost: each merge costs 10 MP, so subtract 1 from count for each target
    // If count becomes negative (meaning 0 or 1 piece), set to 0 as no merge cost applies.
    countOne = (countOne - 1 < 0) ? 0 : (countOne - 1);
    countTwo = (countTwo - 1 < 0) ? 0 : (countTwo - 1);
    countThree = (countThree - 1 < 0) ? 0 : (countThree - 1);

    // Only consider valid combinations where all three targets (A, B, C) have at least one bamboo piece assigned
    if (currentLenOne > 0 && currentLenTwo > 0 && currentLenThree > 0) {
        // Calculate the total cost for this combination
        var currentTotalCost = Math.abs(targetOne - currentLenOne) +
                               Math.abs(targetTwo - currentLenTwo) +
                               Math.abs(targetThree - currentLenThree) +
                               (countOne + countTwo + countThree) * 10;

        // Update the minimum cost if the current combination is cheaper
        if (minCost > currentTotalCost) {
            minCost = currentTotalCost;
        }
    }
}
