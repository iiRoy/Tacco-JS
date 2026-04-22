var fullInputContent = require("fs").readFileSync("/dev/stdin", "utf8");

var contentLines = fullInputContent.split("\n");
var movementPattern = contentLines[0];
var finalCoordinatesRaw = contentLines[1].split(" ");

var targetPositionX = parseInt(finalCoordinatesRaw[0], 10);
var targetPositionY = parseInt(finalCoordinatesRaw[1], 10);

var pathSections = movementPattern.split("T");

var initialForwardStride = pathSections[0].length;
var adjustedTargetX = Math.abs(targetPositionX - initialForwardStride);
var adjustedTargetY = Math.abs(targetPositionY);

var horizontalStrides = [];
var verticalStrides = [];
var totalHorizontalPotential = 0;
var totalVerticalPotential = 0;

for (var sectionIndex = 1; sectionIndex < pathSections.length; ++sectionIndex) {
    var segmentLengthValue = pathSections[sectionIndex].length;
    if (segmentLengthValue === 0) continue;

    if (sectionIndex % 2 === 0) { // Even index sections contribute to X-axis movement
        horizontalStrides.push(segmentLengthValue);
        totalHorizontalPotential += segmentLengthValue;
    } else { // Odd index sections contribute to Y-axis movement
        verticalStrides.push(segmentLengthValue);
        totalVerticalPotential += segmentLengthValue;
    }
}

var checkFeasibility = function(stepLengths, desiredDisplacement, maximumPossibleTravel) {
    if (desiredDisplacement > maximumPossibleTravel) {
        return false;
    }

    if ((maximumPossibleTravel - desiredDisplacement) % 2 !== 0) {
        return false;
    }

    var requiredNegativeSum = (maximumPossibleTravel - desiredDisplacement) / 2;

    var grandTotalSteps = maximumPossibleTravel;
    var achievableSums = new Array(grandTotalSteps + 1).fill(false);
    achievableSums[0] = true;

    for (var currentStrideValue of stepLengths) {
        for (var currentAccumulation = grandTotalSteps; currentAccumulation >= currentStrideValue; --currentAccumulation) {
            if (achievableSums[currentAccumulation - currentStrideValue]) {
                achievableSums[currentAccumulation] = true;
            }
        }
    }
    return achievableSums[requiredNegativeSum];
};

var xFeasible = checkFeasibility(horizontalStrides, adjustedTargetX, totalHorizontalPotential);
var yFeasible = checkFeasibility(verticalStrides, adjustedTargetY, totalVerticalPotential);

if (xFeasible && yFeasible) {
    console.log("Yes");
} else {
    console.log("No");
}