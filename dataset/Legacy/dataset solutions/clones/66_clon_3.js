process.stdin.on("data", function(inputDataBuffer) {
    let horizontalPosition = 0;
    let verticalPosition = 0;
    let accumulatedAngleDegrees = 0;
    const degreesToRadiansConversionFactor = Math.PI / 180;

    const processMovementSegment = (segmentLine) => {
        const segmentParts = segmentLine.split(",");
        const distanceMagnitude = +segmentParts[0];
        const angleIncrementDegrees = +segmentParts[1];

        const currentAngleInRadians = accumulatedAngleDegrees * degreesToRadiansConversionFactor;

        horizontalPosition += distanceMagnitude * Math.sin(currentAngleInRadians);
        verticalPosition += distanceMagnitude * Math.cos(currentAngleInRadians);

        accumulatedAngleDegrees += angleIncrementDegrees;
    };

    const rawInputString = inputDataBuffer.toString();
    const cleanedInputString = rawInputString.trim();
    const inputLinesArray = cleanedInputString.split("\n");

    inputLinesArray.forEach(processMovementSegment);

    console.log(horizontalPosition | 0);
    console.log(verticalPosition | 0);
}).resume();
