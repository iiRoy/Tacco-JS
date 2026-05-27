var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputLines = fileContent.trim().split("\n");

function parseGridDimensions(lineData) {
    const parts = lineData.split(" ").map(Number);
    return {
        gridSize: parts[0],
        operationCount: parts[1]
    };
}

function findFirstEmptySlot(gridArray) {
    const startIndex = 1; // Skip left sentinel
    const endIndex = gridArray.length - 1; // Skip right sentinel
    for (let currentIdx = startIndex; currentIdx < endIndex; currentIdx++) {
        if (gridArray[currentIdx] === 0) {
            return currentIdx;
        }
    }
    return -1; // Indicates no empty slot found
}

while (true) {
    const dimensions = parseGridDimensions(inputLines.shift());
    const gridSize = dimensions.gridSize;
    const operationCount = dimensions.operationCount;

    if (gridSize === 0 && operationCount === 0) {
        break;
    }

    let currentGrid = Array(gridSize).fill(0);
    currentGrid.unshift("X"); // Add left boundary sentinel
    currentGrid.push("X");    // Add right boundary sentinel

    for (let opIdx = 0; opIdx < operationCount; opIdx++) {
        const operationType = inputLines.shift();

        if (operationType === "A") {
            const placementIndex = findFirstEmptySlot(currentGrid);
            if (placementIndex !== -1) {
                currentGrid[placementIndex] = "A";
            }
        } else if (operationType === "B") {
            let bSuccessfullyPlaced = false;
            const rightmostSearchStart = currentGrid.length - 2; // Start from the rightmost actual slot
            const leftmostSearchEnd = 1; // End at the leftmost actual slot

            for (let position = rightmostSearchStart; position >= leftmostSearchEnd; position--) {
                const leftNeighborValue = currentGrid[position - 1];
                const currentSlotValue = currentGrid[position];
                const rightNeighborValue = currentGrid[position + 1];

                if (leftNeighborValue !== "A" && currentSlotValue === 0 && rightNeighborValue !== "A") {
                    currentGrid[position] = "B";
                    bSuccessfullyPlaced = true;
                    break;
                }
            }

            if (!bSuccessfullyPlaced) {
                const placementIndex = findFirstEmptySlot(currentGrid);
                if (placementIndex !== -1) {
                    currentGrid[placementIndex] = "B";
                }
            }
        } else if (operationType === "C") {
            let cSuccessfullyPlaced = false;
            const scanRangeStart = 1; // Start after left sentinel
            const scanRangeEnd = currentGrid.length - 1; // End before right sentinel

            for (let checkIndex = scanRangeStart; checkIndex < scanRangeEnd; checkIndex++) {
                const itemAtCurrentIndex = currentGrid[checkIndex];
                if (itemAtCurrentIndex !== 0) { // Found an occupied slot
                    if (currentGrid[checkIndex + 1] === 0) { // Check right neighbor
                        currentGrid[checkIndex + 1] = "C";
                        cSuccessfullyPlaced = true;
                        break;
                    } else if (currentGrid[checkIndex - 1] === 0) { // Check left neighbor
                        currentGrid[checkIndex - 1] = "C";
                        cSuccessfullyPlaced = true;
                        break;
                    }
                }
            }

            if (!cSuccessfullyPlaced) {
                const middlePositionOffset = (gridSize % 2 === 1) ? Math.floor(gridSize / 2) + 1 : gridSize / 2 + 1;
                currentGrid[middlePositionOffset] = "C";
            }
        } else if (operationType === "D") {
            let bestSpanDetails = {
                placementCenterIndex: 0,
                longestSpanLength: 0
            };

            const gridContentStart = 1;
            const gridContentEnd = currentGrid.length - 1;

            for (let potentialCenterIdx = gridContentStart; potentialCenterIdx < gridContentEnd; potentialCenterIdx++) {
                if (currentGrid[potentialCenterIdx] !== 0) {
                    continue; // Only consider empty slots as potential centers for D
                }

                let leftPointer = potentialCenterIdx;
                let rightPointer = potentialCenterIdx;
                let currentCalculatedSpanLength = 0;

                while (true) {
                    if (currentGrid[leftPointer] !== "X") {
                        leftPointer--;
                    }
                    if (currentGrid[rightPointer] !== "X") {
                        rightPointer++;
                    }

                    if (currentGrid[leftPointer] === "X" && currentGrid[rightPointer] === "X") {
                        break;
                    }
                    if (currentGrid[leftPointer] !== "X" && currentGrid[leftPointer] !== 0) {
                        break;
                    }
                    if (currentGrid[rightPointer] !== "X" && currentGrid[rightPointer] !== 0) {
                        break;
                    }

                    currentCalculatedSpanLength++;
                    if (bestSpanDetails.longestSpanLength < currentCalculatedSpanLength) {
                        bestSpanDetails.longestSpanLength = currentCalculatedSpanLength;
                        bestSpanDetails.placementCenterIndex = potentialCenterIdx;
                    }
                }
            }

            if (bestSpanDetails.placementCenterIndex !== 0 && bestSpanDetails.longestSpanLength !== 0) {
                currentGrid[bestSpanDetails.placementCenterIndex] = "D";
            } else {
                const placementIndex = findFirstEmptySlot(currentGrid);
                if (placementIndex !== -1) {
                    currentGrid[placementIndex] = "D";
                }
            }
        }
    }

    currentGrid.shift(); // Remove left sentinel
    currentGrid.pop();   // Remove right sentinel

    const resultString = currentGrid.join("").replace(/0/g, "#");
    console.log(resultString);
}
