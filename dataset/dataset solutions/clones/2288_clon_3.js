function processInputData(rawData) {
    const lines = rawData.split("\n");

    const firstLineParts = lines[0].split(' ');
    const numCount = Number(firstLineParts[0]);
    const thresholdValue = Number(firstLineParts[1]);

    const inputNumbersStr = lines[1].split(' ');

    const getHalfValue = (numString) => Number(numString) * 0.5;

    const halfValues = inputNumbersStr.map(getHalfValue);

    const productOfHalves = halfValues.reduce((accumulator, currentValue) => accumulator * currentValue, 1);

    let doublingCount = 0;
    let currentProduct = productOfHalves;

    while (currentProduct < thresholdValue) {
        currentProduct *= 2;
        doublingCount++;
    }

    console.log(doublingCount);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
