'use strict';
function assessGeometricShape(dimensionsList) {
    const largestSide = Math.max(dimensionsList[0], dimensionsList[1], dimensionsList[2]);
    const smallestSide = Math.min(dimensionsList[0], dimensionsList[1], dimensionsList[2]);
    const middleSide = dimensionsList[0] + dimensionsList[1] + dimensionsList[2] - largestSide - smallestSide;

    return (smallestSide + middleSide > largestSide) &&
           (largestSide !== middleSide && middleSide !== smallestSide);
}

function processInput(payload) {
    const contentLines = payload.split("\n");
    const totalCount = Number(contentLines[0]);
    const lengthValues = contentLines[1].split(' ').map(Number);

    const finalTally = { count: 0 };

    function retrieveElements(startPoint, currentGroup) {
        if (currentGroup.length === 3) {
            if (assessGeometricShape(currentGroup)) {
                finalTally.count++;
            }
            return;
        }

        if (startPoint >= totalCount) {
            return;
        }
        
        if (currentGroup.length + (totalCount - startPoint) < 3) {
             return;
        }

        retrieveElements(startPoint + 1, [...currentGroup, lengthValues[startPoint]]);

        retrieveElements(startPoint + 1, currentGroup);
    }

    retrieveElements(0, []);

    console.log(finalTally.count);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));