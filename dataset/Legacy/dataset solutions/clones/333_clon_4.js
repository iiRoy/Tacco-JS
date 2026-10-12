function navigateGrid(initialY, initialX, gridData) {
    let currentY = initialY;
    let currentX = initialX;
    const pathHistory = new Set();

    const movementVectors = {
        ">": [0, 1],
        "<": [0, -1],
        "^": [-1, 0],
        "v": [1, 0]
    };

    while (true) {
        const currentPositionKey = `${currentY},${currentX}`;

        if (pathHistory.has(currentPositionKey)) {
            return "LOOP";
        }

        const cellSymbol = gridData[currentY][currentX];

        if (cellSymbol === ".") {
            return `${currentX} ${currentY}`;
        }

        pathHistory.add(currentPositionKey);

        const vector = movementVectors[cellSymbol];
        const deltaY = vector ? vector[0] : 0;
        const deltaX = vector ? vector[1] : 0;

        currentY += deltaY;
        currentX += deltaX;
    }
}

const rawInputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n");

let problemSets = [];
let linePointer = 0;

while (true) {
    const dimensionsLine = rawInputLines[linePointer++];
    const [heightValue, widthValue] = dimensionsLine.split(" ").map(Number);

    if (heightValue === 0 && widthValue === 0) {
        break;
    }

    const currentGridRepresentation = [];
    for (let rowIdx = 0; rowIdx < heightValue; rowIdx++) {
        currentGridRepresentation.push(rawInputLines[linePointer++].split(""));
    }
    problemSets.push({ gridHeight: heightValue, gridWidth: widthValue, gridContent: currentGridRepresentation });
}

problemSets.forEach(problemEntry => {
    const finalOutcome = navigateGrid(0, 0, problemEntry.gridContent);
    console.log(finalOutcome);
});
