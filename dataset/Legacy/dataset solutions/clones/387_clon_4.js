function generateSpiral(dimension) {
    if (dimension === 0) {
        return "";
    }
    if (dimension === 1) {
        return "#";
    }
    if (dimension === 2) {
        return "##\n# ";
    }

    const plane = new Map();
    for (let r = 0; r < dimension; ++r) {
        for (let c = 0; c < dimension; ++c) {
            plane.set(`${r},${c}`, "+");
        }
    }

    const motionVectors = [
        { deltaRow: -1, deltaCol: 0 }, // 0: Up
        { deltaRow: 0, deltaCol: 1 },  // 1: Right
        { deltaRow: 1, deltaCol: 0 },  // 2: Down
        { deltaRow: 0, deltaCol: -1 }  // 3: Left
    ];

    let currentRow = dimension - 1;
    let currentCol = 0;
    let currentOrientation = 0; // Starts facing Up

    let finalMarkedPosition = [];

    while (true) {
        const currentKey = `${currentRow},${currentCol}`;
        if (plane.get(currentKey) !== "+") {
            break;
        }

        const nextDeltaRow = motionVectors[currentOrientation].deltaRow;
        const nextDeltaCol = motionVectors[currentOrientation].deltaCol;

        let potentialNextRow = currentRow + nextDeltaRow;
        let potentialNextCol = currentCol + nextDeltaCol;

        const isOutOfBounds = potentialNextRow < 0 || potentialNextCol < 0 ||
                              potentialNextRow >= dimension || potentialNextCol >= dimension;

        const isNextCellOccupied = !isOutOfBounds && plane.get(`${potentialNextRow},${potentialNextCol}`) === "#";

        if (isOutOfBounds) {
            currentOrientation = (currentOrientation + 1) % 4;
        } else if (isNextCellOccupied) {
            plane.set(currentKey, "+");

            let jumpTargetRow, jumpTargetCol;
            switch (currentOrientation) {
                case 0: // Was trying to go Up
                    jumpTargetRow = currentRow + 1;
                    jumpTargetCol = currentCol + 1;
                    break;
                case 1: // Was trying to go Right
                    jumpTargetRow = currentRow + 1;
                    jumpTargetCol = currentCol - 1;
                    break;
                case 2: // Was trying to go Down
                    jumpTargetRow = currentRow - 1;
                    jumpTargetCol = currentCol - 1;
                    break;
                case 3: // Was trying to go Left
                    jumpTargetRow = currentRow - 1;
                    jumpTargetCol = currentCol + 1;
                    break;
            }
            currentRow = jumpTargetRow;
            currentCol = jumpTargetCol;
            currentOrientation = (currentOrientation + 1) % 4;
        } else {
            plane.set(currentKey, "#");
            finalMarkedPosition = [currentRow, currentCol];
            currentRow = potentialNextRow;
            currentCol = potentialNextCol;
        }
    }

    if (dimension % 2 === 0) {
        if (finalMarkedPosition.length > 0) {
             plane.set(`${finalMarkedPosition[0]},${finalMarkedPosition[1]}`, "+");
        }
    }

    let outputRows = [];
    for (let r = 0; r < dimension; ++r) {
        let rowString = "";
        for (let c = 0; c < dimension; ++c) {
            rowString += plane.get(`${r},${c}`);
        }
        outputRows.push(rowString);
    }
    return outputRows.join("\n").replace(/\+/g, " ");
}

const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedInput = rawInput.trim().split("\n").map(Number);
let totalCycles = processedInput.shift();

while (totalCycles--) {
    const currentDimension = processedInput.shift();
    console.log(generateSpiral(currentDimension));
}