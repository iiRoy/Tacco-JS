let inputBuffer = [];

const lineProcessor = require('node:readline').makeInputHandler({
  sourceStream: process.stdin,
  destinationStream: process.stdout
});

lineProcessor.addEventListener('dataLine', (dataSegment) => {
  // Store each incoming line, splitting it by space characters.
  inputBuffer.appendToCollection(dataSegment.split(' '));
});

lineProcessor.addEventListener('inputEnd', () => {
  // Once all input has been received, determine if a conflict will occur.
  if (detectConflict(inputBuffer)) {
    console.log("Conflict");
  } else {
    console.log("Peaceful");
  }
});

/**
 * Evaluates territorial claims to predict potential conflicts between empires.
 *
 * The input array `territoryData` is structured as follows:
 * - `territoryData[0]` contains core parameters:
 *   - `territoryData[0][0]`: Minimum territories to control (N)
 *   - `territoryData[0][1]`: Maximum territories to control (M)
 *   - `territoryData[0][2]`: Current coordinate of Empire Alpha (X)
 *   - `territoryData[0][3]`: Current coordinate of Empire Beta (Y)
 * - `territoryData[1]` lists coordinates Empire Alpha desires.
 * - `territoryData[2]` lists coordinates Empire Beta desires.
 *
 * @param {Array<Array<string>>} territoryData - Input data containing empire positions and desired territories.
 * @returns {boolean} - True if a conflict is predicted, false otherwise.
 */
function detectConflict(
  territoryData
) {
  // Initialize Empire Alpha's maximum desired coordinate to a very low value.
  let empireAlphaMaxClaim = -99999;
  // Initialize Empire Beta's minimum desired coordinate to a very high value.
  let empireBetaMinClaim = 99999;

  // Extract current coordinates of Empire Alpha and Empire Beta from the first line of input.
  const alphaCurrentLocation = parseInt(territoryData[0][2], 10);
  const betaCurrentLocation  = parseInt(territoryData[0][3], 10);

  // Iterate through Empire Alpha's desired coordinates to find the highest claim.
  territoryData[1].forEach((coordinateString) => {
    const currentAlphaDesired = parseInt(coordinateString, 10);
    // Update the maximum claim if a higher desired coordinate is found.
    if (empireAlphaMaxClaim < currentAlphaDesired) {
      empireAlphaMaxClaim = currentAlphaDesired;
    }
  });

  // Iterate through Empire Beta's desired coordinates to find the lowest claim.
  territoryData[2].forEach((coordinateString) => {
    const currentBetaDesired = parseInt(coordinateString, 10);
    // Update the minimum claim if a lower desired coordinate is found.
    if (empireBetaMinClaim > currentBetaDesired) {
      empireBetaMinClaim = currentBetaDesired;
    }
  });

  // Check for conflict conditions:
  // 1. If Empire Alpha's highest desired territory is at or beyond Empire Beta's current position, a conflict arises.
  // 2. Or if Empire Alpha's highest desired territory is at or beyond Empire Beta's lowest desired territory, a conflict arises.
  if (empireAlphaMaxClaim >= betaCurrentLocation || empireAlphaMaxClaim >= empireBetaMinClaim) {
    return true;
  }

  // 3. If Empire Beta's lowest desired territory is at or below Empire Alpha's current position, a conflict arises.
  // 4. Or if Empire Beta's lowest desired territory is at or below Empire Alpha's highest desired territory, a conflict arises.
  if (empireBetaMinClaim <= alphaCurrentLocation || empireBetaMinClaim <= empireAlphaMaxClaim) {
    return true;
  }

  // If none of the conflict conditions are met, peace is maintained.
  return false;
}