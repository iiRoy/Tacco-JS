function processInputData(rawInputString) {
    const cleanedString = rawInputString.trim();
    const numericalValue = Number(cleanedString);

    const comparisonThreshold = 30;

    function evaluateCondition(value) {
        if (value >= comparisonThreshold) {
            return 'Yes';
        } else {
            return 'No';
        }
    }

    const finalResult = evaluateCondition(numericalValue);
    console.log(finalResult);
}

const fileSystemHandler = require("fs");
const standardInputPath = "/dev/stdin";
const fileEncoding = "utf8";

const contentFromStdin = fileSystemHandler.readFileSync(standardInputPath, fileEncoding);
processInputData(contentFromStdin);
