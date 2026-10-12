const fileSystem = require('fs');
const inputLines = fileSystem.readFileSync('/dev/stdin', 'utf8').split('\n');

const firstLineParts = inputLines[0].split(' ');
const operationCount = +firstLineParts[0];
const initialTally = {
    'A': +firstLineParts[1],
    'B': +firstLineParts[2],
    'C': +firstLineParts[3]
};

const operationInstructions = [];
for (let i = 0; i < operationCount; i++) {
    operationInstructions.push(inputLines[i + 1]);
}

function resolveOperation(currentTallyState, currentInstruction, subsequentInstruction) {
    const [firstChar, secondChar] = currentInstruction.split('');
    const firstCharValue = currentTallyState[firstChar];
    const secondCharValue = currentTallyState[secondChar];

    if (firstCharValue === 0 && secondCharValue === 0) {
        return [null, null, false];
    }

    if (firstCharValue === 0) {
        return [{ ...currentTallyState, [firstChar]: firstCharValue + 1, [secondChar]: secondCharValue - 1 }, firstChar, true];
    }
    if (secondCharValue === 0) {
        return [{ ...currentTallyState, [firstChar]: firstCharValue - 1, [secondChar]: secondCharValue + 1 }, secondChar, true];
    }

    if (subsequentInstruction !== undefined) {
        if (firstCharValue === 1 && subsequentInstruction.includes(firstChar)) {
            return [{ ...currentTallyState, [firstChar]: firstCharValue + 1, [secondChar]: secondCharValue - 1 }, firstChar, true];
        }
        if (secondCharValue === 1 && subsequentInstruction.includes(secondChar)) {
            return [{ ...currentTallyState, [firstChar]: firstCharValue - 1, [secondChar]: secondCharValue + 1 }, secondChar, true];
        }
    }

    if (subsequentInstruction === undefined) {
        if (firstCharValue < secondCharValue) {
            return [{ ...currentTallyState, [firstChar]: firstCharValue + 1, [secondChar]: secondCharValue - 1 }, firstChar, true];
        } else {
            return [{ ...currentTallyState, [firstChar]: firstCharValue - 1, [secondChar]: secondCharValue + 1 }, secondChar, true];
        }
    } else {
        return [{ ...currentTallyState, [firstChar]: firstCharValue + 1, [secondChar]: secondCharValue - 1 }, firstChar, true];
    }
}

const processingOutcome = operationInstructions.reduce((accumulator, currentInstruction, index) => {
    if (!accumulator.isFeasible) {
        return accumulator;
    }

    const subsequentInstruction = operationInstructions[index + 1];

    const [updatedTally, chosenAction, operationSuccess] = resolveOperation(
        accumulator.currentTally,
        currentInstruction,
        subsequentInstruction
    );

    if (!operationSuccess) {
        return { ...accumulator, isFeasible: false };
    }

    return {
        currentTally: updatedTally,
        actionSequence: [...accumulator.actionSequence, chosenAction],
        isFeasible: true
    };
}, { currentTally: initialTally, actionSequence: [], isFeasible: true });

if (!processingOutcome.isFeasible) {
    console.log('No');
} else {
    console.log('Yes');
    processingOutcome.actionSequence.forEach(action => console.log(action));
}
