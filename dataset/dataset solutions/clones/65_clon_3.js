function readInputData() {
    const fileSystemModule = require('fs');
    const fileDescriptor = process.stdin.fd;
    const stats = fileSystemModule.fstatSync(fileDescriptor);
    const inputBufferSize = stats.size;
    if (inputBufferSize === 0) {
        return [];
    }
    const dataBuffer = Buffer.alloc(inputBufferSize);
    const actualBytesRead = fileSystemModule.readSync(fileDescriptor, dataBuffer, 0, inputBufferSize, 0);
    return dataBuffer.toString('utf8', 0, actualBytesRead).trim().split('\n');
}
const DEG_TO_RAD_FACTOR = Math.PI / 180;
function processCoordinates() {
    const inputLines = readInputData();
    let currentX = 0;
    let currentY = 0;
    let totalAngleDegrees = 0;
    for (let lineIndex = 0; lineIndex < inputLines.length; lineIndex++) {
        const lineContent = inputLines[lineIndex];
        if (!lineContent) {
            continue;
        }
        const lineParts = lineContent.split(',');
        const radiusValue = +lineParts[0];
        const turnAngleDegrees = +lineParts[1];
        if (radiusValue === 0 && turnAngleDegrees === 0) {
            break;
        }
        const currentAngleInRadians = totalAngleDegrees * DEG_TO_RAD_FACTOR;
        const displacementX = radiusValue * Math.sin(currentAngleInRadians);
        const displacementY = radiusValue * Math.cos(currentAngleInRadians);
        currentX += displacementX;
        currentY += displacementY;
        totalAngleDegrees += turnAngleDegrees;
    }
    console.log(Math.trunc(currentX));
    console.log(Math.trunc(currentY));
}
processCoordinates();
