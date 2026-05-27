function processInputData(rawData) {
    const linesOfText = rawData.split('\n');
    const parsedNumericArrays = linesOfText.map(lineContent =>
        lineContent.split(' ').map(strValue => Number.parseInt(strValue, 10))
    );
    return parsedNumericArrays;
}

function calculateProductSum(dataStructure) {
    const relevantSequence = dataStructure[1];

    let runningPrefixSum = 0;
    let finalComputedValue = 0;

    for (const currentNumber of relevantSequence) {
        finalComputedValue += currentNumber * runningPrefixSum;
        runningPrefixSum += currentNumber;
    }
    return finalComputedValue;
}

function executeProgram(sourceInputText) {
    const processedData = processInputData(sourceInputText);
    const resultOutput = calculateProductSum(processedData);
    console.log(resultOutput);
}

executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));
