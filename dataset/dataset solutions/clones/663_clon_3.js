const fsModule = require('fs');
const inputSource = '/dev/stdin';
const srcData = fsModule.readFileSync(inputSource, 'utf8');
const trimmedData = srcData.trim();
let dataLines = trimmedData.split("\n");

const endMarker = "0 0";

let currentCaseParams;
while ((currentCaseParams = dataLines.shift()) !== endMarker) {
    const parsedParams = currentCaseParams.split(" ").map(Number);
    const gridDim = parsedParams[0];
    const cutCount = parsedParams[1];

    const markedCells = {};

    for (let k = 0; k < cutCount; k++) {
        const cutSpec = dataLines.shift().split(" ");
        const planeType = cutSpec[0];
        const valA = Number(cutSpec[1]);
        const valB = Number(cutSpec[2]);

        for (let idx = 0; idx < gridDim; idx++) {
            let coordParts = [];
            if (planeType === "xy") {
                coordParts.push(valA, valB, idx);
            } else if (planeType === "xz") {
                coordParts.push(valA, idx, valB);
            } else { // planeType === "yz"
                coordParts.push(idx, valA, valB);
            }
            markedCells[coordParts.join(",")] = true;
        }
    }
    const totalCubes = gridDim * gridDim * gridDim;
    const uniqueMarked = Object.keys(markedCells).length;
    console.log(totalCubes - uniqueMarked);
}
