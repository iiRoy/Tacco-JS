var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

function formatAsFraction(numericValue) {
    if (Number.isInteger(numericValue)) {
        return String(numericValue);
    }

    let currentDivisor = 1;
    while (true) {
        if (Number.isInteger(numericValue * currentDivisor)) {
            return `${numericValue * currentDivisor}/${currentDivisor}`;
        }
        currentDivisor++;
    }
}

var inputLines = fileContent.trim().split("\n");
const BASE_ANGLE_VALUE = 90;

while (true) {
    var currentInstruction = inputLines.shift();

    if (currentInstruction === "#") {
        break;
    }

    currentInstruction = currentInstruction.replace(/orth|est/g, "");

    let calculatedAngle = 0;
    let initialDirectionChar = currentInstruction[0];

    switch (initialDirectionChar) {
        case "n":
            calculatedAngle = 0;
            break;
        case "w":
            calculatedAngle = BASE_ANGLE_VALUE;
            break;
        // No default needed as per original logic, only 'n' and 'w' are handled for initial char.
    }

    let previousDirection = initialDirectionChar;
    let stepPower = 1;

    for (let charIdx = 1; charIdx < currentInstruction.length; charIdx++) {
        let currentChar = currentInstruction[charIdx];
        let angleAdjustment = BASE_ANGLE_VALUE / Math.pow(2, stepPower);

        if (currentChar === "n" && previousDirection !== "n") {
            calculatedAngle -= angleAdjustment;
        } else if (currentChar === "w" && previousDirection !== "w") {
            calculatedAngle += angleAdjustment;
        }

        if (previousDirection === currentChar) {
            stepPower++;
        } else {
            stepPower = 1;
        }
        previousDirection = currentChar;
    }

    console.log(formatAsFraction(calculatedAngle));
}
