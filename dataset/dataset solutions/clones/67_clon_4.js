const fileSystemModule = require("node:fs");

const coordinateAccumulator = (currentLocation, movementInstruction) => {
    const [travelDistance, angularAdjustment] = movementInstruction.split(',').map(Number);
    
    const currentBearingRadians = currentLocation.currentBearing * Math.PI / 180;
    
    const nextHorizontal = currentLocation.horizontalPosition + travelDistance * Math.sin(currentBearingRadians);
    const nextVertical = currentLocation.verticalPosition + travelDistance * Math.cos(currentBearingRadians);
    const nextBearing = currentLocation.currentBearing + angularAdjustment;
    
    return {
        horizontalPosition: nextHorizontal,
        verticalPosition: nextVertical,
        currentBearing: nextBearing,
    };
};

const processedPath = fileSystemModule.readFileSync("/dev/stdin", "utf8")
    .trim()
    .split('\n')
    .reduce(coordinateAccumulator, { horizontalPosition: 0, verticalPosition: 0, currentBearing: 0 });

console.log(Math.trunc(processedPath.horizontalPosition));
console.log(Math.trunc(processedPath.verticalPosition));