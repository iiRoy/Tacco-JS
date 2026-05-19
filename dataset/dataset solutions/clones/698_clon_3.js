const fileSystem = require('fs');
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
let inputLines = rawInputData.trim().split("\n");

// Helper function to parse a line of space-separated numbers into an array of numbers
const parseNumberLine = (lineContent) => lineContent.split(" ").map(Number);

// Helper function to apply directional rotation and normalize case to a path signature string
function getRotatedSignature(baseSignature, rotationType) {
    let transformedSignature = baseSignature;
    switch (rotationType) {
        case 'N': // North (original orientation, 'n' becomes 'N', 'e' becomes 'E', etc.)
            transformedSignature = transformedSignature.replace(/n/g, "N").replace(/e/g, "E").replace(/s/g, "S").replace(/w/g, "W");
            break;
        case 'E': // East (90 degrees clockwise rotation)
            transformedSignature = transformedSignature.replace(/n/g, "E").replace(/e/g, "S").replace(/s/g, "W").replace(/w/g, "N");
            break;
        case 'S': // South (180 degrees rotation)
            transformedSignature = transformedSignature.replace(/n/g, "S").replace(/e/g, "W").replace(/s/g, "N").replace(/w/g, "E");
            break;
        case 'W': // West (270 degrees clockwise rotation)
            transformedSignature = transformedSignature.replace(/n/g, "W").replace(/e/g, "N").replace(/s/g, "E").replace(/w/g, "S");
            break;
        default:
            // In a robust system, one might throw an error or log a warning here.
            // For this problem, we assume valid rotationType inputs.
            break;
    }
    return transformedSignature;
}

while (true) {
    const numberOfSets = Number(inputLines.shift());
    if (numberOfSets === 0) {
        break;
    }

    let referencePathSignature = "";

    for (let currentSetIndex = 0; currentSetIndex < numberOfSets + 1; currentSetIndex++) {
        let numberOfPoints = Number(inputLines.shift());
        let coordinatePoints = [];

        for (let pointCounter = 0; pointCounter < numberOfPoints; pointCounter++) {
            coordinatePoints.push(parseNumberLine(inputLines.shift()));
        }

        let generatedPathSegments = [];
        for (let segmentIterator = 1; segmentIterator < coordinatePoints.length; segmentIterator++) {
            const previousPoint = coordinatePoints[segmentIterator - 1];
            const currentPoint = coordinatePoints[segmentIterator];

            const isXCoordinateConstant = previousPoint[0] === currentPoint[0];
            const isYCoordinateConstant = previousPoint[1] === currentPoint[1];

            if (isXCoordinateConstant) { // Movement along Y-axis
                if (previousPoint[1] > currentPoint[1]) {
                    generatedPathSegments.push(["s", previousPoint[1] - currentPoint[1]]); // South
                } else {
                    generatedPathSegments.push(["n", currentPoint[1] - previousPoint[1]]); // North
                }
            } else if (isYCoordinateConstant) { // Movement along X-axis
                if (previousPoint[0] > currentPoint[0]) {
                    generatedPathSegments.push(["w", previousPoint[0] - currentPoint[0]]); // West
                } else {
                    generatedPathSegments.push(["e", currentPoint[0] - previousPoint[0]]); // East
                }
            }
        }

        const forwardDirectionSignature = generatedPathSegments.join("");
        // Note: .reverse() modifies the array in place.
        // The original code's 'f' (referencePathSignature) was based on the reversed path.
        const backwardDirectionSignature = generatedPathSegments.reverse().join("");

        if (currentSetIndex === 0) {
            // For the first set (index 0), the reference signature is derived from the *reversed* path
            // (which is the current state of generatedPathSegments after the .reverse() call).
            referencePathSignature = getRotatedSignature(generatedPathSegments.join(""), 'N');
        } else {
            const allPossibleSignatures = [
                getRotatedSignature(forwardDirectionSignature, 'N'),
                getRotatedSignature(forwardDirectionSignature, 'E'),
                getRotatedSignature(forwardDirectionSignature, 'S'),
                getRotatedSignature(forwardDirectionSignature, 'W'),
                getRotatedSignature(backwardDirectionSignature, 'N'),
                getRotatedSignature(backwardDirectionSignature, 'E'),
                getRotatedSignature(backwardDirectionSignature, 'S'),
                getRotatedSignature(backwardDirectionSignature, 'W')
            ];

            if (allPossibleSignatures.includes(referencePathSignature)) {
                console.log(currentSetIndex);
            }
        }
    }
    console.log("+++++");
}
