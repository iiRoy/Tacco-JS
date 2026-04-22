const   contentSource = require('fs').readFileSync('/dev/stdin', 'utf8');

let     lineSegments = contentSource.trim().split("\n");

while ( true ) {

    let     currentDimensions = lineSegments.shift();

    if ( currentDimensions === "0 0" ) { break; }

    let     parsedValues = currentDimensions.split(" ").map(parseInt);

    const   cubeDimension = parsedValues[0];
    const   constraintQuantity = parsedValues[1];

    const   blockedPositions = new Set();

    for ( let constraintIndex = 0; constraintIndex < constraintQuantity; constraintIndex++ ) {

        const   constraintLine = lineSegments.shift().split(" ");

        const   planeCategory = constraintLine[0];
        const   valueOne = parseInt(constraintLine[1]);
        const   valueTwo = parseInt(constraintLine[2]);

        if ( planeCategory === "xy" ) {
            for ( let zCoordinate = 0; zCoordinate < cubeDimension; zCoordinate++ ) {
                blockedPositions.add(`${valueOne},${valueTwo},${zCoordinate}`);
            }
        }
        else if ( planeCategory === "xz" ) {
            for ( let yCoordinate = 0; yCoordinate < cubeDimension; yCoordinate++ ) {
                blockedPositions.add(`${valueOne},${yCoordinate},${valueTwo}`);
            }
        }
        else if ( planeCategory === "yz" ) {
            for ( let xCoordinate = 0; xCoordinate < cubeDimension; xCoordinate++ ) {
                blockedPositions.add(`${xCoordinate},${valueOne},${valueTwo}`);
            }
        }
    }

    const   totalVolume = cubeDimension * cubeDimension * cubeDimension;
    const   unblockedCount = totalVolume - blockedPositions.size;

    console.log(unblockedCount);
}