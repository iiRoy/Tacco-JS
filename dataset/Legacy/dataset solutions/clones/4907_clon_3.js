function parseAndConvertInput(rawInputString) {
    const trimmedString = rawInputString.trim();
    const stringParts = trimmedString.split(" ");
    const numericArray = stringParts.map(numString => Number(numString));
    return numericArray;
}

function calculateDistinctElementCount(inputNumbers) {
    const assumedTotalElements = 3;
    let distinctCount = assumedTotalElements;

    const sortedNumbers = [...inputNumbers].sort((a, b) => b - a);

    const numberOfChecks = 2;
    for (let i = 0; i < numberOfChecks; i++) {
        const currentNum = sortedNumbers[i];
        const nextNum = sortedNumbers[i + 1];

        if (currentNum === nextNum) {
            distinctCount--;
        }
    }
    return distinctCount;
}

function processInputData(fullInputContent) {
    const processedNumbers = parseAndConvertInput(fullInputContent);
    const finalResult = calculateDistinctElementCount(processedNumbers);
    console.log(finalResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
