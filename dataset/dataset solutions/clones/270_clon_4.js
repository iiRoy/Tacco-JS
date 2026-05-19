var inputData = require('fs').readFileSync('/dev/stdin', 'utf8');
var numericInputs = (inputData.trim()).split("\n").map(Number);

for (let inputIndex = 0; inputIndex < numericInputs.length; inputIndex++) {
    let currentDimension = numericInputs[inputIndex];
    let valueLimit = currentDimension * currentDimension + 1;

    if (currentDimension === 0) {
        break;
    }

    let magicGrid = Array.from({ length: currentDimension }, () => Array(currentDimension).fill(-1));

    let currentVal = 1;
    let rawY = Math.floor(currentDimension / 2) + 1;
    let rawX = Math.floor(currentDimension / 2);

    while (currentVal < valueLimit) {
        let wrappedY = rawY;
        let wrappedX = rawX;

        // Apply toroidal wrapping for grid access
        if (wrappedX < 0) wrappedX = currentDimension - 1;
        if (wrappedY < 0) wrappedY = currentDimension - 1;
        if (wrappedX >= currentDimension) wrappedX = 0;
        if (wrappedY >= currentDimension) wrappedY = 0;

        if (magicGrid[wrappedY][wrappedX] !== -1) {
            // If the current candidate position is occupied,
            // the next candidate position for the *same* currentVal is (rawY + 1, rawX - 1).
            rawY = rawY + 1;
            rawX = rawX - 1;
        } else {
            // If empty, place the number.
            magicGrid[wrappedY][wrappedX] = ("   " + currentVal).slice(-4);
            currentVal++;
            // The next candidate position for the *new* currentVal is (rawY + 1, rawX + 1).
            rawY = rawY + 1;
            rawX = rawX + 1;
        }
    }

    console.log(magicGrid.map(row => row.join("")).join("\n"));
}
