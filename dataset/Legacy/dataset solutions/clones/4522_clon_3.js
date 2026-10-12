function processInputData(rawData) {
    const lines = rawData.split("\n");
    const firstLineContent = lines[0];
    const firstLineParts = firstLineContent.split(" ");

    const parseDecimalInteger = (strValue) => {
        return parseInt(strValue, 10);
    };

    const redComponent = parseDecimalInteger(firstLineParts[0]);
    const greenComponent = parseDecimalInteger(firstLineParts[1]);
    const blueComponent = parseDecimalInteger(firstLineParts[2]);

    const HUNDRED_FACTOR = 100;
    const TEN_FACTOR = 10;
    const DIVISIBILITY_CHECK_VALUE = 4;

    const calculatedCombinedValue = (redComponent * HUNDRED_FACTOR) + (greenComponent * TEN_FACTOR) + blueComponent;

    const isResultDivisible = (calculatedCombinedValue % DIVISIBILITY_CHECK_VALUE) === 0;

    let finalOutputString;
    if (isResultDivisible) {
        finalOutputString = 'YES';
    } else {
        finalOutputString = 'NO';
    }
    
    console.log('%s', finalOutputString);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
