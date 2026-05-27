const fileSystemUtility = require("fs");

const standardInputPath = "/dev/stdin";
const encodingFormat = "utf8";

const rawInputData = fileSystemUtility.readFileSync(standardInputPath, encodingFormat);

const inputTokensArray = rawInputData.split(/\s/);

let tokenIndexPosition = 0;
let currentNumericValue;

const computeQuadraticExpression = (inputVal) => {
    const valSquared = inputVal * inputVal;
    const valPlusTwo = inputVal + 2;
    const numeratorSum = valSquared + valPlusTwo;
    return numeratorSum / 2;
};

while (tokenIndexPosition < inputTokensArray.length) {
    const tokenString = inputTokensArray[tokenIndexPosition];
    tokenIndexPosition++;

    currentNumericValue = +tokenString;

    if (!currentNumericValue) {
        break;
    }

    const calculatedResult = computeQuadraticExpression(currentNumericValue);

    console.log(calculatedResult);
}
