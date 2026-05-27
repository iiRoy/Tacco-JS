const parseNumericValue = (str) => parseInt(str, 10);

function processInputData(rawInputString) {
    const inputLines = rawInputString.split('\n');

    let numericDataArray = inputLines.map(parseNumericValue);

    const initialElementCount = numericDataArray[0];
    numericDataArray.shift();

    const highestValueInArray = Math.max(...numericDataArray);
    const indexOfHighestValue = numericDataArray.indexOf(highestValueInArray);

    const modificationFactor = 2;
    numericDataArray[indexOfHighestValue] = numericDataArray[indexOfHighestValue] / modificationFactor;

    const finalComputedSum = numericDataArray.reduce((currentAccumulator, element) => {
        return currentAccumulator + element;
    }, 0);

    console.log(finalComputedSum);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
