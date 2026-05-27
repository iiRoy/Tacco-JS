function parseTaskLine(lineString) {
    const stringParts = lineString.split(" ");
    return stringParts.map(Number);
}

function processRawInput(rawData) {
    const processedLines = rawData.split("\n");
    const firstLineParts = processedLines[0].split(" ");
    const initialCount = Number(firstLineParts[0]);

    const parsedTasks = [];
    for (let lineIndex = 1; lineIndex < processedLines.length; lineIndex++) {
        const currentLine = processedLines[lineIndex];
        if (currentLine.trim() === "") {
            continue;
        }
        parsedTasks.push(parseTaskLine(currentLine));
    }
    return { initialCount, parsedTasks };
}

function determineNumberProperties(numVal, valA, valB, valC, valD) {
    let factorCount2 = 0;
    let factorCount3 = 0;
    let factorCount5 = 0;

    let tempDivisorFor2 = 0;
    let tempDivisorFor3 = 0;
    let tempDivisorFor5 = 0;

    while (numVal % 2 === 0) {
        tempDivisorFor2 = numVal / 2;
        factorCount2++;
        determineNumberProperties(tempDivisorFor2, valA, valB, valC, valD);
    }
    while (numVal % 3 === 0) {
        tempDivisorFor3 = numVal / 3;
        factorCount3++;
        determineNumberProperties(tempDivisorFor3, valA, valB, valC, valD);
    }
    while (numVal % 5 === 0) {
        tempDivisorFor5 = numVal / 5;
        factorCount5++;
        determineNumberProperties(tempDivisorFor5, valA, valB, valC, valD);
    }

    if (factorCount2 === 0 && factorCount3 === 0 && factorCount5 === 0) {
        const resultFromIncrement = determineNumberProperties(numVal + 1, valA, valB, valC, valD);
        const resultFromDecrement = determineNumberProperties(numVal - 1, valA, valB, valC, valD);
        const finalRecursiveMin = Math.min(resultFromIncrement, resultFromDecrement);
        return finalRecursiveMin;
    }
}

function processInputData(rawData) {
    const { initialCount, parsedTasks } = processRawInput(rawData);

    const taskCount = parsedTasks.length;
    const taskCosts = Array(taskCount);

    const unusedAccumulator = 0;

    for (let taskIndex = 0; taskIndex < taskCount; taskIndex++) {
        const currentTaskParams = parsedTasks[taskIndex];
        const numVal = currentTaskParams[0];
        const valA = currentTaskParams[1];
        const valB = currentTaskParams[2];
        const valC = currentTaskParams[3];
        const valD = currentTaskParams[4];

        const calculatedCost = determineNumberProperties(numVal, valA, valB, valC, valD);
        taskCosts[taskIndex] = calculatedCost;
        console.log(taskCosts[taskIndex]);
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
