function processInputData(rawInputString) {
    const LINE_DELIMITER = "\n";
    const NUMBER_DELIMITER = " ";
    const POWER_BASE = 3;
    const EVEN_CHECK_DIVISOR = 2;
    const INITIAL_PRODUCT_VALUE = 1;

    const parsedInputLines = rawInputString.split(LINE_DELIMITER);

    const powerExponentString = parsedInputLines[0];
    const numberSequenceString = parsedInputLines[1];

    const exponentAsNumber = Number(powerExponentString);

    const calculatedPowerResult = Math.pow(POWER_BASE, exponentAsNumber);

    let cumulativeEvenProduct = INITIAL_PRODUCT_VALUE;

    const stringNumbersArray = numberSequenceString.split(NUMBER_DELIMITER);
    const numericValuesArray = stringNumbersArray.map(function(strValue) {
        return Number(strValue);
    });

    const checkIsEven = (num) => {
        return num % EVEN_CHECK_DIVISOR === 0;
    };

    for (const currentNumericValue of numericValuesArray) {
        if (checkIsEven(currentNumericValue)) {
            cumulativeEvenProduct *= EVEN_CHECK_DIVISOR;
        }
    }

    console.log(calculatedPowerResult - cumulativeEvenProduct);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
