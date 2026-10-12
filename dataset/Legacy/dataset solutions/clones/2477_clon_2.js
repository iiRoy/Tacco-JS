inputData = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

// Extract the first line and parse dimensions and target volume
const firstLineParts = inputData.shift().split(' ');

const dimA = Number(firstLineParts.shift()); // First dimension of the block
const dimB = Number(firstLineParts.shift()); // Second dimension of the block
const targetVol = Number(firstLineParts.shift()); // Desired water volume

// Initialize variables for binary search
let lowerBound = 0; // Lower limit for the angle search
let upperBound = 90; // Upper limit for the angle search
let currentAngle = 45; // Midpoint angle for iteration

let loopCount = 0; // Counter to prevent infinite loops

// Calculate the total volume of the rectangular block
const totalBlockVolume = dimA * dimA * dimB;

// Determine which scenario applies based on target volume relative to half the block's volume
if (totalBlockVolume / 2 < targetVol) {
    // Scenario 1: Water fills more than half the block.
    // The empty space forms a triangular prism at the top.
    // We are searching for the angle of the empty space.
    while (lowerBound < upperBound) {
        // Calculate the volume of the empty space (triangular prism)
        // The base of the triangle is dimA, height is dimA * tan(currentAngle)
        const emptySpaceVolume = (dimA * dimA * Math.tan(currentAngle / 180 * Math.PI)) / 2 * dimA;
        // The actual water volume is total volume minus empty space
        const calculatedVolume = totalBlockVolume - emptySpaceVolume;

        if (targetVol < calculatedVolume) {
            // If target volume is less than calculated, the angle of empty space is too large
            lowerBound = currentAngle;
        } else {
            // If target volume is greater or equal, the angle of empty space is too small
            upperBound = currentAngle;
        }

        // Update the current angle for the next iteration
        currentAngle = (lowerBound + upperBound) / 2;

        // Increment iteration counter and break if too many iterations
        loopCount++;
        if (loopCount > 200) {
            break;
        }
    }
    // Output the found angle, formatted to 10 decimal places
    console.log(currentAngle.toFixed(10));
} else {
    // Scenario 2: Water fills half or less of the block.
    // The water forms a triangular prism.
    // We are searching for the angle of the water surface.
    while (lowerBound < upperBound) {
        // Calculate the volume of the water (triangular prism)
        // The base of the triangle is dimB, height is dimB * tan(currentAngle)
        const calculatedVolume = (dimB * dimB * Math.tan(currentAngle / 180 * Math.PI)) / 2 * dimA;

        if (targetVol < calculatedVolume) {
            // If target volume is less than calculated, the angle of water is too large
            upperBound = currentAngle;
        } else {
            // If target volume is greater or equal, the angle of water is too small
            lowerBound = currentAngle;
        }

        // Update the current angle for the next iteration
        currentAngle = (lowerBound + upperBound) / 2;

        // Increment iteration counter and break if too many iterations
        loopCount++;
        if (loopCount > 200) {
            break;
        }
    }
    // Output the complement of the found angle, formatted to 10 decimal places
    // This is because the problem asks for the angle of tilt, not the water surface angle.
    console.log((90 - currentAngle).toFixed(10));
}
