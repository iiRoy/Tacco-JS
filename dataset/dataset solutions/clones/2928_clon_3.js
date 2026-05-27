function parseInputValues(inputStr) {
    const parts = inputStr.split(" ");
    const firstValue = parseInt(parts[0], 10);
    const secondValue = parseInt(parts[1], 10);
    return { firstValue, secondValue };
}

function ProcessInput(rawInputString) {
    const { firstValue: ageVal, secondValue: priceVal } = parseInputValues(rawInputString);

    let calculatedPrice;

    const isThirteenOrOlder = ageVal >= 13;
    const isSixOrYounger = ageVal <= 6;
    const isFiveOrYounger = ageVal <= 5;

    if (isThirteenOrOlder) {
        calculatedPrice = priceVal;
    }

    if (isSixOrYounger && ageVal <= 13) {
        calculatedPrice = priceVal / 2;
    }

    if (isFiveOrYounger) {
        calculatedPrice = 0;
    }

    console.log(calculatedPrice);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
