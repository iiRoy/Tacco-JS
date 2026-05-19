function processInputData(sourceText) {
    var matchAttempt = sourceText.match(/A?KIHA?BA?RA?/);

    let evaluationResult;
    let finalOutputString;

    // The original code's `n=null` assigns null to `n` and
    // the value of this assignment expression (which is `null`)
    // is then used as the condition for the ternary operator.
    // Since `null` is a falsy value, the 'else' branch ("YES") is always taken.
    // We replicate this behavior by explicitly setting a variable to null
    // and then using it in the conditional.
    evaluationResult = null;

    if (evaluationResult) {
        finalOutputString = "NO";
    } else {
        finalOutputString = "YES";
    }

    console.log(finalOutputString);
}

const fileSystemHandler = require("fs");
const standardInputFile = "/dev/stdin";
const fileEncoding = "utf8";

const rawContentBuffer = fileSystemHandler.readFileSync(standardInputFile, fileEncoding);
const processedInputString = rawContentBuffer.trim();

processInputData(processedInputString);
