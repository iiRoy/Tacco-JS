const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
let lineBuffer = rawData.trim().split("\n");

while (true) {
    const dimAndOpsLine = lineBuffer.shift();
    if (dimAndOpsLine === "0 0") break;

    const [cubeDim, opCount] = dimAndOpsLine.split(" ").map(Number);
    const voidedCells = new Set();

    for (let opIdx = 0; opIdx < opCount; opIdx++) {
        let opDetails = lineBuffer.shift().split(" ");
        const opType = opDetails.shift();
        const planeCoords = opDetails.map(val => Number(val) - 1);

        switch (opType) {
            case "xy":
                for (let zCoord = 0; zCoord < cubeDim; zCoord++) {
                    voidedCells.add(`${planeCoords[0]},${planeCoords[1]},${zCoord}`);
                }
                break;
            case "xz":
                for (let yCoord = 0; yCoord < cubeDim; yCoord++) {
                    voidedCells.add(`${planeCoords[0]},${yCoord},${planeCoords[1]}`);
                }
                break;
            case "yz":
                for (let xCoord = 0; xCoord < cubeDim; xCoord++) {
                    voidedCells.add(`${xCoord},${planeCoords[0]},${planeCoords[1]}`);
                }
                break;
        }
    }

    const totalCells = cubeDim * cubeDim * cubeDim;
    const remainingSolid = totalCells - voidedCells.size;
    console.log(remainingSolid);
}
