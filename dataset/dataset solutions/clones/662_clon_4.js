const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
let dataLines = fileContent.trim().split('\n');

while (true) {
    const currentLine = dataLines.shift();
    if (currentLine === "0 0") {
        break;
    }

    const [cubeDimension, holeCount] = currentLine.split(' ').map(Number);

    const removedCells = new Set();

    const coordinateStringGenerators = new Map([
        ['xy', (fixedCoord1, fixedCoord2, varyingCoord) => `${fixedCoord1},${fixedCoord2},${varyingCoord}`],
        ['xz', (fixedCoord1, fixedCoord2, varyingCoord) => `${fixedCoord1},${varyingCoord},${fixedCoord2}`],
        ['yz', (fixedCoord1, fixedCoord2, varyingCoord) => `${varyingCoord},${fixedCoord1},${fixedCoord2}`]
    ]);

    Array.from({ length: holeCount }).forEach(() => {
        const [planeType, coordAStr, coordBStr] = dataLines.shift().split(' ');
        const valA = Number(coordAStr);
        const valB = Number(coordBStr);

        const generateCoordString = coordinateStringGenerators.get(planeType);

        if (generateCoordString) {
            Array.from({ length: cubeDimension }, (_, index) => index + 1)
                 .forEach(varyingVal => {
                     removedCells.add(generateCoordString(valA, valB, varyingVal));
                 });
        }
    });

    console.log(cubeDimension * cubeDimension * cubeDimension - removedCells.size);
}
