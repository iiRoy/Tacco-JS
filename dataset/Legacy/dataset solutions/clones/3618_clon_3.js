function calculateDivisibilityResult(inputLineString) {
    const numberParts = inputLineString.split(" ");

    const firstInteger = parseInt(numberParts[0], 10);
    const secondInteger = parseInt(numberParts[1], 10);

    const remainderValue = firstInteger % secondInteger;

    const finalOutcome = (remainderValue === 0) ? 0 : 1;
    
    return finalOutcome;
}

function processProgramInput(rawInputData) {
    const inputLinesArray = rawInputData.split("\n");
    const targetLine = inputLinesArray[0];

    const computedAnswer = calculateDivisibilityResult(targetLine);

    console.log(String(computedAnswer));
}

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
processProgramInput(fileContent);
