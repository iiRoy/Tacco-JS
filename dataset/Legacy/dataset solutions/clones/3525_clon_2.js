let inputData = [];

let inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputProcessor.on('line', function(currentLine){
  inputData.push(currentLine.split(" "));
});

inputProcessor.on('close', function(){
  // After processing all input lines, evaluate the conditions for a conflict.
  if(determineConflict(inputData)) {
    console.log("War");
  } else {
    console.log("No War");
  }
});

/**
 * Analyzes territorial claims and current positions of two empires to predict a conflict.
 *
 * The `territoryInfo` array is structured as follows:
 * - `territoryInfo[0]` contains general parameters, where:
 *   - Index 2 represents Empire A's current geographical coordinate.
 *   - Index 3 represents Empire B's current geographical coordinate.
 * - `territoryInfo[1]` is a list of coordinates that Empire A wishes to control.
 * - `territoryInfo[2]` is a list of coordinates that Empire B wishes to control.
 *
 * @param {Array<Array<string>>} territoryInfo - The parsed input data.
 * @returns {boolean} `true` if a conflict is predicted, `false` otherwise.
 */
function determineConflict(territoryInfo){
  // Initialize the highest desired coordinate for Empire A to a very low value.
  let highestAClaim = -100;
  // Initialize the lowest desired coordinate for Empire B to a very high value.
  let lowestBClaim = 100;

  // Extract and convert Empire A's current position from the first line of input.
  const empireAPosition = Number(territoryInfo[0][2]);
  // Extract and convert Empire B's current position from the first line of input.
  const empireBPosition = Number(territoryInfo[0][3]);

  // Iterate through Empire A's claimed coordinates to find the maximum value.
  territoryInfo[1].map((claimStr) => {
    const currentAClaim = Number(claimStr);
    if(highestAClaim < currentAClaim) {
      highestAClaim = currentAClaim;
    }
  });

  // Iterate through Empire B's claimed coordinates to find the minimum value.
  territoryInfo[2].map((claimStr) => {
    const currentBClaim = Number(claimStr);
    if(lowestBClaim > currentBClaim) {
      lowestBClaim = currentBClaim;
    }
  });

  // Check the first set of conditions for a conflict:
  // If Empire A's highest claim is at or beyond Empire B's current position,
  // OR if Empire A's highest claim is at or beyond Empire B's lowest desired claim.
  if (highestAClaim >= empireBPosition || highestAClaim >= lowestBClaim) {
    return true;
  }

  // Check the second set of conditions for a conflict:
  // If Empire B's lowest claim is at or below Empire A's current position,
  // OR if Empire B's lowest claim is at or below Empire A's highest desired claim.
  if (lowestBClaim <= empireAPosition || lowestBClaim <= highestAClaim) {
    return true;
  }

  // If no conflict conditions are met, return false.
  return false;
}
