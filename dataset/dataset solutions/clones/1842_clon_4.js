const acquireGridData = (textualInput) => {
    const lines = textualInput.trim().split('\n');
    const extent = Number(lines[0]);
    const sequence = lines[1].split(' ').map(Number);
    return { gridExtent: extent, occupancySequence: sequence };
};

const obtainCoordinates = (seatIdentifier, extent) => {
    const zeroIndexedRow = Math.floor((seatIdentifier - 1) / extent);
    const zeroIndexedCol = (seatIdentifier - 1) % extent;
    return [zeroIndexedRow, zeroIndexedCol];
};

const calculateTotalDiscomfort = (initialData) => {
    const gridExtent = initialData.gridExtent;
    const occupancySequence = initialData.occupancySequence;

    const finalState = occupancySequence.reduce((accumulator, currentSeatIdentifier) => {
        let currentDiscomfort = accumulator.discomfort;
        const currentOccupied = accumulator.occupied;

        const [currentRow, currentCol] = obtainCoordinates(currentSeatIdentifier, gridExtent);

        currentOccupied.add(`${currentRow},${currentCol}`);

        if (currentRow === 0 || currentRow === gridExtent - 1 || currentCol === 0 || currentCol === gridExtent - 1) {
            return { discomfort: currentDiscomfort, occupied: currentOccupied };
        }

        const countFreeInDirection = (coordsGenerator) => {
            return Array.from(coordsGenerator)
                        .filter(([r, c]) => !currentOccupied.has(`${r},${c}`))
                        .length;
        };

        const leftCoords = Array.from({ length: currentRow }, (_, i) => [currentRow - 1 - i, currentCol]);
        const freeLeft = countFreeInDirection(leftCoords);

        const rightCoords = Array.from({ length: gridExtent - 1 - currentRow }, (_, i) => [currentRow + 1 + i, currentCol]);
        const freeRight = countFreeInDirection(rightCoords);

        const upCoords = Array.from({ length: currentCol }, (_, i) => [currentRow, currentCol - 1 - i]);
        const freeUp = countFreeInDirection(upCoords);

        const downCoords = Array.from({ length: gridExtent - 1 - currentCol }, (_, i) => [currentRow, currentCol + 1 + i]);
        const freeDown = countFreeInDirection(downCoords);
        
        currentDiscomfort += Math.min(freeLeft, freeRight, freeUp, freeDown);

        return { discomfort: currentDiscomfort, occupied: currentOccupied };
    }, { discomfort: 0, occupied: new Set() });

    return finalState.discomfort;
};

const executeSeatingProcess = (rawInput) => {
    const processed = acquireGridData(rawInput);
    const finalDiscomfort = calculateTotalDiscomfort(processed);
    console.log(finalDiscomfort);
};

executeSeatingProcess(require("fs").readFileSync("/dev/stdin", "utf8"));