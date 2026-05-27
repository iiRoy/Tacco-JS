const getProcessedInputLines = (rawInputText) => {
    return rawInputText.trim().split("\n");
};

const determineInitialAngle = (firstChar) => {
    if (firstChar === "n") {
        return 0;
    }
    if (firstChar === "w") {
        return 90;
    }
    return 0;
};

const formatAngleAsFraction = (decimalValue) => {
    let currentDenominator = 1;
    while (true) {
        if ((decimalValue * currentDenominator) % 1 === 0) {
            if (currentDenominator === 1) {
                return String(decimalValue);
            }
            return `${decimalValue * currentDenominator}/${currentDenominator}`;
        }
        currentDenominator++;
    }
};

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = getProcessedInputLines(fileContent);

while (true) {
    let currentInstruction = inputLines.shift();

    if (currentInstruction === "#") {
        break;
    }

    currentInstruction = currentInstruction.replace(/orth|est/g, "");
    currentInstruction = currentInstruction.split("").reverse().join("");

    let calculatedAngle = determineInitialAngle(currentInstruction[0]);

    for (let segmentIndex = 1; segmentIndex < currentInstruction.length; segmentIndex++) {
        const powerOfTwo = Math.pow(2, segmentIndex);
        const angleAdjustment = 90 / powerOfTwo;

        if (currentInstruction[segmentIndex] === "n") {
            calculatedAngle -= angleAdjustment;
        } else if (currentInstruction[segmentIndex] === "w") {
            calculatedAngle += angleAdjustment;
        }
    }

    const finalOutput = formatAngleAsFraction(calculatedAngle);
    console.log(finalOutput);
}
