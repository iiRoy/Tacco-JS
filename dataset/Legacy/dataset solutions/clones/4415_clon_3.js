function executeLogic(fullInputString) {
    let firstCharOfInput = fullInputString[0];

    const characterAtInitialPosition = firstCharOfInput[0];
    const characterAtThirdPosition = firstCharOfInput[2];

    const arePositionsEqual = (characterAtInitialPosition == characterAtThirdPosition);

    let outputDecision;
    if (arePositionsEqual) {
        outputDecision = "Yes";
    } else {
        outputDecision = "No";
    }

    console.log(outputDecision);
}

const fileSystemUtility = require("fs");
const standardInputSource = "/dev/stdin";
const textEncoding = "utf8";

const rawContentFromStdin = fileSystemUtility.readFileSync(standardInputSource, textEncoding);

executeLogic(rawContentFromStdin);
