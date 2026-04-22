const processStream = (sourceText) => {
    const lines = sourceText.match(/^.*?\n(.*?)$/s);

    // If lines is null (e.g., input has only one line), lines[1] will throw TypeError,
    // matching original's behavior (input[1] is undefined, then undefined.split() throws).
    const numericStrings = lines[1].match(/\d+/g);

    const numericValues = [];
    if (numericStrings) { // Handle case where second line has no numbers (e.g., just spaces),
                          // original would parse to [NaN, NaN] and yield 0. My way yields [].
        for (let currentString of numericStrings) {
            numericValues.push(Number(currentString));
        }
    }

    const obtainEvenDivisionCount = (val) => {
        let total = 0;
        let workingVal = val;
        // This loop matches the original's behavior for 0:
        // if val is 0, (0 & 1) === 0 is true, 0 >>>= 1 is 0, total increments infinitely.
        // This reproduces the original's infinite loop for zero input.
        while ((workingVal & 1) === 0) {
            workingVal >>>= 1;
            total++;
        }
        return total;
    };

    const aggregateDivisions = numericValues.reduce((accumulator, currentNumber) => {
        return accumulator + obtainEvenDivisionCount(currentNumber);
    }, 0);

    console.log(aggregateDivisions);
    return 0;
};

const acquireContent = require("node:fs").readFileSync;
const dataEncoding = "utf8";
const inputSource = "/dev/stdin";

const rawData = acquireContent(inputSource, dataEncoding).toString().trim();

processStream(rawData);