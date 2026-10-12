'use strict';

function getResultString(conditionMet) {
    const positiveOutcomeMessage = "YES";
    const negativeOutcomeMessage = "NO";
    return conditionMet ? positiveOutcomeMessage : negativeOutcomeMessage;
}

function evaluateStringConnections(firstStr, secondStr, thirdStr) {
    const firstStrLastChar = firstStr.slice(-1);
    const secondStrFirstChar = secondStr.slice(0, 1);
    const secondStrLastChar = secondStr.slice(-1);
    const thirdStrFirstChar = thirdStr.slice(0, 1);

    const isFirstConnectionValid = (firstStrLastChar === secondStrFirstChar);
    const isSecondConnectionValid = (secondStrLastChar === thirdStrFirstChar);

    return isFirstConnectionValid && isSecondConnectionValid;
}

function processInputData(rawInputContent) {
    const newlineDelimiter = "\n";
    const spaceDelimiter = " ";

    const allInputLines = rawInputContent.split(newlineDelimiter);
    const relevantLine = allInputLines[0];

    const stringSegments = relevantLine.split(spaceDelimiter);

    const primaryString = stringSegments[0];
    const secondaryString = stringSegments[1];
    const tertiaryString = stringSegments[2];

    const finalConditionResult = evaluateStringConnections(primaryString, secondaryString, tertiaryString);

    console.log(getResultString(finalConditionResult));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
