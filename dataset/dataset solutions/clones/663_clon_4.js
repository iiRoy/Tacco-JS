var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputLines = fileContent.trim().split("\n");

while (true) {
    var currentConfigLine = inputLines.shift();
    if (currentConfigLine === "0 0") break;

    const [dimensionSize, sliceOperations] = currentConfigLine.split(" ").map(Number);

    let occupiedCells = Array.from({ length: dimensionSize }, () =>
        Array.from({ length: dimensionSize }, () =>
            Array.from({ length: dimensionSize }, () => false)
        )
    );

    for (let operationCounter = 0; operationCounter < sliceOperations; operationCounter++) {
        const operationDetails = inputLines.shift().split(" ");
        const planeIdentifier = operationDetails[0];
        const coordOne = Number(operationDetails[1]);
        const coordTwo = Number(operationDetails[2]);

        const planeMarkers = {
            "xy": (idx) => occupiedCells[coordOne][coordTwo][idx] = true,
            "xz": (idx) => occupiedCells[coordOne][idx][coordTwo] = true,
            "yz": (idx) => occupiedCells[idx][coordOne][coordTwo] = true
        };

        Array.from({ length: dimensionSize }, (_, iteratorIndex) => {
            planeMarkers[planeIdentifier](iteratorIndex);
        });
    }

    const totalMarkedCount = occupiedCells.flat(2).filter(Boolean).length;
    console.log(dimensionSize * dimensionSize * dimensionSize - totalMarkedCount);
}
