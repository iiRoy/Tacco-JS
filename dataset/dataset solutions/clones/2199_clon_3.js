function processInput(rawInputString) {
    const initialNumericValue = Number(rawInputString);
    let currentNumericValue = initialNumericValue;
    let powerExponent = 0;
    while (currentNumericValue > 0) {
        currentNumericValue = Math.floor(currentNumericValue / 2);
        powerExponent++;
    }
    const BASE_FOR_POWER = 2;
    const calculatedResult = Math.pow(BASE_FOR_POWER, powerExponent) - 1;
    console.log(calculatedResult);
}
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
