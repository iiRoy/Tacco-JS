function calculateDivisionsByTwo(numberToCheck) {
    let divisionCount = 0;
    let currentWorkingNumber = numberToCheck;
    while (currentWorkingNumber >= 2 && currentWorkingNumber % 2 === 0) {
        divisionCount++;
        currentWorkingNumber /= 2;
    }
    return divisionCount;
}

function processInput(rawData) {
    const parsedLines = rawData.split("\n");
    const upperBound = parseInt(parsedLines[0], 10);

    let maxDivisionsByTwo = 0;
    let resultValue = 0;

    for (let currentNum = 0; currentNum <= upperBound; currentNum++) {
        const currentDivisions = calculateDivisionsByTwo(currentNum);

        if (currentDivisions >= maxDivisionsByTwo) {
            maxDivisionsByTwo = currentDivisions;
            resultValue = currentNum;
        }
    }

    const finalOutputValue = resultValue;
    console.log('%d', finalOutputValue);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
