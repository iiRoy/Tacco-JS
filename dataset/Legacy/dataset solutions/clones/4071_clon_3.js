function processInput(rawInputString) {
    const firstLineContent = rawInputString.split("\n")[0];
    const lineSegments = firstLineContent.split(" ");

    const firstNumericPart = lineSegments[0];
    const secondNumericPart = lineSegments[1];

    const concatenatedNumericString = firstNumericPart + secondNumericPart;
    const targetNumberValue = parseInt(concatenatedNumericString, 10);

    const isPerfectSquare = (numToCheck) => {
        const rootResult = Math.sqrt(numToCheck);
        return rootResult % 1 === 0;
    };

    const POSITIVE_RESPONSE = "Yes";
    const NEGATIVE_RESPONSE = "No";

    const finalResult = isPerfectSquare(targetNumberValue) ? POSITIVE_RESPONSE : NEGATIVE_RESPONSE;
    console.log(finalResult);
}

const fileSystemModule = require("fs");
const standardInputData = fileSystemModule.readFileSync("/dev/stdin", "utf8");
processInput(standardInputData);
