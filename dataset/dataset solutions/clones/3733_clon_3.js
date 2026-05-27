function processInputData(rawDataString) {
    const inputLines = rawDataString.split('\n');

    const firstLineContent = inputLines[0];
    const firstLineNumbersStr = firstLineContent.split(' ');

    const totalCountN = parseInt(firstLineNumbersStr[0], 10);
    const capacityK = parseInt(firstLineNumbersStr[1], 10);

    // The original code parsed the second line into an array 'A',
    // but this variable was never used in the final calculation or output.
    // Removing this non-essential parsing step as a Type III modification.
    // const itemValues = inputLines[1].split(' ').map(val => parseInt(val, 10));

    const numeratorValue = totalCountN - 1;
    const denominatorValue = capacityK - 1;

    const divisionResult = numeratorValue / denominatorValue;
    const finalCalculatedResult = Math.ceil(divisionResult);

    console.log(finalCalculatedResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
