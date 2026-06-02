function processInputData(sourceData) {
    const dataSegments = sourceData.split(" ");

    const convertToInteger = (strVal) => {
        return parseInt(strVal, 10);
    };

    const primaryNumber = convertToInteger(dataSegments[0]);
    const secondaryNumber = convertToInteger(dataSegments[1]);

    const divisionRemainder = primaryNumber % secondaryNumber;

    let resultToDisplay;
    if (divisionRemainder === 0) {
        resultToDisplay = -1;
    } else {
        resultToDisplay = primaryNumber;
    }

    console.log(resultToDisplay);
}

const standardInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
processInputData(standardInputContent);
