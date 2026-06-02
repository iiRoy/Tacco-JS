process.stdin.resume();
process.stdin.setEncoding('utf8');

function processInputAndCalculate(rawData) {
    let inputLines = rawData.split('\n');
    let dataLines = inputLines.slice(1);
    let numericData = dataLines.map(item => Number(item));

    let totalIntegerProductCount = numericData.reduce((accumulator, currentVal, currentIndex, fullArray) => {
        let currentElementMatches = fullArray.slice(currentIndex).filter(subsequentVal => {
            return Number.isInteger(currentVal * subsequentVal);
        }).length;
        return accumulator + currentElementMatches;
    }, 0);

    console.log(totalIntegerProductCount);
}

processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
