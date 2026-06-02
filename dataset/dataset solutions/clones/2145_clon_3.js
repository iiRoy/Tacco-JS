function parseAndSortNumericString(inputLine, separator) {
    const parsedNumbers = inputLine.split(separator).map(str => parseInt(str));
    parsedNumbers.sort();
    return parsedNumbers;
}

function processInputData(rawData) {
    const DEFAULT_RESULT_VALUE = 'No';
    const POSITIVE_RESULT_VALUE = 'Yes';
    const LINE_DELIMITER = "\n";
    const NUMBER_DELIMITER = ' ';

    let currentResult = DEFAULT_RESULT_VALUE;

    const trimmedInputContent = rawData.trim();
    const inputLinesArray = trimmedInputContent.split(LINE_DELIMITER);
    const firstLineOfInput = inputLinesArray[0];

    const sortedNumericValues = parseAndSortNumericString(firstLineOfInput, NUMBER_DELIMITER);

    const firstPairIdenticalAndThirdDifferent = (sortedNumericValues[0] === sortedNumericValues[1] && sortedNumericValues[0] !== sortedNumericValues[2]);
    const secondPairIdenticalAndFirstDifferent = (sortedNumericValues[1] === sortedNumericValues[2] && sortedNumericValues[0] !== sortedNumericValues[2]);

    if (firstPairIdenticalAndThirdDifferent || secondPairIdenticalAndFirstDifferent) {
        currentResult = POSITIVE_RESULT_VALUE;
    }

    console.log(currentResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
