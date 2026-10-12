const sourceContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const instructionSet = sourceContent.trim().split("\n");

const mathOperations = {
    "+": (firstNum, secondNum) => firstNum + secondNum,
    "-": (firstNum, secondNum) => firstNum - secondNum,
    "*": (firstNum, secondNum) => firstNum * secondNum,
    "/": (firstNum, secondNum) => Math.trunc(firstNum / secondNum)
};

const terminationCommandIndex = instructionSet.findIndex(
    (commandLine) => commandLine.split(" ")[1] === "%"
);

const commandsToExecute = terminationCommandIndex === -1
    ? instructionSet
    : instructionSet.slice(0, terminationCommandIndex);

commandsToExecute.forEach((commandString) => {
    const commandParts = commandString.split(" ");
    const operandA = Number(commandParts[0]);
    const operatorSymbol = commandParts[1];
    const operandB = Number(commandParts[2]);

    const operationFunction = mathOperations[operatorSymbol];
    if (operationFunction) {
        console.log(operationFunction(operandA, operandB));
    }
});
