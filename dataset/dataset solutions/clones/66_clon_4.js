process.stdin.on("data", function(inputBuffer) {
    const degreeToRadianConversionFactor = Math.PI / 180;

    const finalCoordinateState = String(inputBuffer)
        .trim()
        .split('\n')
        .filter(lineEntry => lineEntry.length > 0)
        .reduce((currentSpatialState, movementInstruction) => {
            const [currentXPosition, currentYPosition, currentAngularOrientation] = currentSpatialState;
            const [distanceValueString, angleChangeValueString] = movementInstruction.split(',');

            const stepDistance = Number(distanceValueString);
            const angleIncrementDegrees = Number(angleChangeValueString);

            const currentAngularOrientationRadians = currentAngularOrientation * degreeToRadianConversionFactor;

            const nextXPosition = currentXPosition + stepDistance * Math.sin(currentAngularOrientationRadians);
            const nextYPosition = currentYPosition + stepDistance * Math.cos(currentAngularOrientationRadians);
            const nextAngularOrientation = currentAngularOrientation + angleIncrementDegrees;

            return [nextXPosition, nextYPosition, nextAngularOrientation];
        }, [0, 0, 0]);

    const [finalXOutput, finalYOutput] = finalCoordinateState;

    console.log(finalXOutput | 0);
    console.log(finalYOutput | 0);
}).resume();
