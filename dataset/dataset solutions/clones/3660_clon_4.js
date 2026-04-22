function calculateResult(rawData) {
    const numberMatches = rawData.matchAll(/\d+/g);

    let firstNumeric = null;
    let runningTotal = 0;
    let itemCounter = 0;

    for (const matchEntry of numberMatches) {
        const currentNumericalValue = parseInt(matchEntry[0], 10);
        if (itemCounter === 0) {
            firstNumeric = currentNumericalValue;
        } else {
            runningTotal += currentNumericalValue;
        }
        itemCounter++;
    }

    if (firstNumeric === null || itemCounter < 2) {
        return 0; 
    }

    return runningTotal - firstNumeric;
}

const inputContent = require("fs").readFileSync("/dev/stdin", "utf8");
console.log(calculateResult(inputContent));