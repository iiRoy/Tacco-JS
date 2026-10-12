const convertToInteger = (strValue) => parseInt(strValue, 10);

const parseNumericLine = (lineContent) => {
    const stringTokens = lineContent.split(" ");
    return stringTokens.map(convertToInteger);
};

function processInputData(rawInputString) {
    const inputLines = rawInputString.split("\n");

    const configurationValues = parseNumericLine(inputLines[0]);
    const totalElementsCount = configurationValues[0];

    const sourceNumberSequence = parseNumericLine(inputLines[1]);

    const orderedResult = new Array(configurationValues);

    for (let currentIterationIndex = 1; currentIterationIndex <= totalElementsCount; currentIterationIndex++) {
        const valueToMap = sourceNumberSequence[currentIterationIndex];
        orderedResult[valueToMap] = currentIterationIndex;
    }

    console.log(orderedResult.join(' '));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
