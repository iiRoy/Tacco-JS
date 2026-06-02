const stdio = require('fs');

const rawInputContent = stdio.readFileSync(process.stdin.fd, 'utf8');
const primaryInputLine = rawInputContent.split('\n')[0];

function generateBrainfuckSequence() {
    const initialBrainfuckPrefix = '>++++++[<+++++>-]<[>+>+>+>++>++>++>+++>+++>+++>++++<<<<<<<<<<-]>';
    const initialCellValues = [30, 30, 30, 60, 60, 60, 90, 90, 90, 120];

    const characterArray = Array.from(primaryInputLine);

    const finalAccumulatedState = characterArray.reduce((currentAccumulator, charElement) => {
        const charCodeValue = charElement.charCodeAt(0);
        const targetCellIndex = Math.floor((charCodeValue - 33) / 11);

        const pointerShiftMagnitude = Math.abs(currentAccumulator.activePointerIndex - targetCellIndex);
        const pointerShiftDirection = currentAccumulator.activePointerIndex < targetCellIndex ? '>' : '<';
        currentAccumulator.generatedOutput += pointerShiftDirection.repeat(pointerShiftMagnitude);

        const cellValueDelta = charCodeValue - currentAccumulator.cellMemory[targetCellIndex];
        const cellValueOperation = cellValueDelta > 0 ? '+' : '-';
        currentAccumulator.generatedOutput += cellValueOperation.repeat(Math.abs(cellValueDelta));

        currentAccumulator.cellMemory[targetCellIndex] = charCodeValue;
        currentAccumulator.generatedOutput += '.';
        currentAccumulator.activePointerIndex = targetCellIndex;

        return currentAccumulator;
    }, {
        generatedOutput: initialBrainfuckPrefix,
        cellMemory: [...initialCellValues],
        activePointerIndex: 0
    });

    console.log(finalAccumulatedState.generatedOutput);
}

generateBrainfuckSequence();
