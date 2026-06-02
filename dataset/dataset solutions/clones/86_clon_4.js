const rawDataInput = require('fs').readFileSync('/dev/stdin', 'utf8');

const processedLines = rawDataInput.trim().split('\n').slice(1);

for (const currentInputLine of processedLines) {
    const numericCoordinates = currentInputLine.split(' ').map(val => Number(val) * 100000);

    const firstPointX = numericCoordinates[0];
    const firstPointY = numericCoordinates[1];
    const secondPointX = numericCoordinates[2];
    const secondPointY = numericCoordinates[3];
    const thirdPointX = numericCoordinates[4];
    const thirdPointY = numericCoordinates[5];
    const fourthPointX = numericCoordinates[6];
    const fourthPointY = numericCoordinates[7];

    let areLinesParallel = "NO";

    const lineOneDeltaX = secondPointX - firstPointX;
    const lineOneDeltaY = secondPointY - firstPointY;
    const lineTwoDeltaX = fourthPointX - thirdPointX;
    const lineTwoDeltaY = fourthPointY - thirdPointY;

    // The original code only checks for parallelism if both lines are non-vertical.
    // If either line is vertical (deltaX is zero), it implicitly outputs "NO".
    if (lineOneDeltaX === 0 || lineTwoDeltaX === 0) {
        areLinesParallel = "NO";
    } else {
        // For non-vertical lines, check if their direction vectors are parallel
        // using the cross-product concept: (v1x * v2y) - (v1y * v2x) === 0
        if (lineOneDeltaX * lineTwoDeltaY === lineOneDeltaY * lineTwoDeltaX) {
            areLinesParallel = "YES";
        } else {
            areLinesParallel = "NO";
        }
    }

    console.log(areLinesParallel);
}
