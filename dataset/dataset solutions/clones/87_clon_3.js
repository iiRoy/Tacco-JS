const fileSystemModule = require("fs");

function determineSlopeEquality(segmentCoordinates) {
    const firstPointX1 = parseFloat(segmentCoordinates[0]);
    const firstPointY1 = parseFloat(segmentCoordinates[1]);
    const firstPointX2 = parseFloat(segmentCoordinates[2]);
    const firstPointY2 = parseFloat(segmentCoordinates[3]);

    const secondPointX1 = parseFloat(segmentCoordinates[4]);
    const secondPointY1 = parseFloat(segmentCoordinates[5]);
    const secondPointX2 = parseFloat(segmentCoordinates[6]);
    const secondPointY2 = parseFloat(segmentCoordinates[7]);

    const deltaY_segmentA = firstPointY2 - firstPointY1;
    const deltaX_segmentA = firstPointX2 - firstPointX1;
    const slopeA_raw = deltaY_segmentA / deltaX_segmentA;
    const formattedSlopeA = slopeA_raw.toFixed(6);

    const deltaY_segmentB = secondPointY2 - secondPointY1;
    const deltaX_segmentB = secondPointX2 - secondPointX1;
    const slopeB_raw = deltaY_segmentB / deltaX_segmentB;
    const formattedSlopeB = slopeB_raw.toFixed(6);

    const areSlopesIdentical = (formattedSlopeA === formattedSlopeB);

    return areSlopesIdentical ? 'YES' : 'NO';
}

const inputBuffer = fileSystemModule.readFileSync("/dev/stdin", "utf8");
const inputLinesArray = inputBuffer.split('\n');

inputLinesArray.forEach(function(currentInputLine) {
    const coordinateValues = currentInputLine.split(' ');
    const resultString = determineSlopeEquality(coordinateValues);
    console.log(resultString);
});
