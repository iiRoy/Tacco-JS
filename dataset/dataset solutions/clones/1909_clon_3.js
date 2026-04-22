const fileSystem = require("fs");

const fileContent = fileSystem.readFileSync("/dev/stdin", "utf8");

const inputInstructions = fileContent.trim().split("\n");

if (inputInstructions.length === 0) {
    console.log("No");
    return;
}

const configLine = inputInstructions.shift();
if (!configLine) {
    console.log("No");
    return;
}
const configParameters = configLine.trim().split(" ").map(val => parseInt(val, 10));

const maxSteps = configParameters[0];
const initialCountA = configParameters[1];
const initialCountB = configParameters[2];
const initialCountC = configParameters[3];

if (isNaN(maxSteps) || isNaN(initialCountA) || isNaN(initialCountB) || isNaN(initialCountC) || maxSteps <= 0) {
    console.log("Invalid initial configuration.");
    console.log("No");
    return;
}

const processingStack = [];

processingStack.push({
    A: initialCountA,
    B: initialCountB,
    C: initialCountC,
    opLog: []
});

let finalSolutionState = null;

while (processingStack.length > 0) {
    const currentOperationState = processingStack.pop();

    if (currentOperationState.opLog.length >= maxSteps) {
        finalSolutionState = currentOperationState;
        break;
    }

    const instructionIndex = currentOperationState.opLog.length;
    if (instructionIndex >= inputInstructions.length) {
        continue;
    }

    const currentInstructionLine = inputInstructions[instructionIndex];
    if (!currentInstructionLine) {
        continue;
    }
    const instructionParts = currentInstructionLine.trim().split(""); 

    const sourceResourceKey = instructionParts[0];
    const targetResourceKey = instructionParts[1];

    const validKeys = ['A', 'B', 'C'];
    if (!validKeys.includes(sourceResourceKey) || !validKeys.includes(targetResourceKey)) {
        console.warn(`Warning: Invalid resource key encountered: ${sourceResourceKey}${targetResourceKey}. Skipping instruction.`);
        continue;
    }

    if (currentOperationState[sourceResourceKey] > 0) {
        const nextStateOption1 = { ...currentOperationState };

        nextStateOption1[sourceResourceKey] -= 1;
        nextStateOption1[targetResourceKey] += 1;

        nextStateOption1.opLog = [...currentOperationState.opLog, targetResourceKey];

        processingStack.push(nextStateOption1);
    }

    if (currentOperationState[targetResourceKey] > 0) {
        const nextStateOption2 = { ...currentOperationState };

        nextStateOption2[sourceResourceKey] += 1;
        nextStateOption2[targetResourceKey] -= 1;

        nextStateOption2.opLog = [...currentOperationState.opLog, targetResourceKey];

        processingStack.push(nextStateOption2);
    }
}

if (finalSolutionState) {
    console.log("Yes");
    console.log(finalSolutionState.opLog.join("\n"));
} else {
    console.log("No");
}