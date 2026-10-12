const parseSpaceSeparatedNumbers = (numberString) => {
    const numberStringsArray = numberString.split(" ");
    const numericValues = numberStringsArray.map(Number);
    return numericValues;
};

function processInputData (rawDataContent) {
    const LINE_DELIMITER = "\n";

    const allInputLines = rawDataContent.trim().split(LINE_DELIMITER);

    const firstSetOfNumbersLine = allInputLines[1];
    const uniqueTargetNumbers = new Set(parseSpaceSeparatedNumbers(firstSetOfNumbersLine));

    const queryCountString = allInputLines[2];
    const numberOfQueries = parseInt(queryCountString, 10);

    const queryNumbersLine = allInputLines[3];
    const numbersToQuery = parseSpaceSeparatedNumbers(queryNumbersLine);

    let foundMatchesCount = 0;

    for (let currentQueryIndex = 0; currentQueryIndex < numberOfQueries; currentQueryIndex++) {
        const currentNumberBeingQueried = numbersToQuery[currentQueryIndex];
        if (uniqueTargetNumbers.has(currentNumberBeingQueried)) {
            foundMatchesCount++;
        }
    }

    console.log(foundMatchesCount);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
