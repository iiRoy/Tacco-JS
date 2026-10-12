function checkValueLimit(val, limit) {
    return val <= limit;
}

function processInputData(rawInputString) {
    const dataParts = rawInputString.split(' ');

    const firstNumericValue = parseInt(dataParts[0], 10);
    const secondNumericValue = parseInt(dataParts[1], 10);

    const MAX_ALLOWED_VALUE = 8;

    const isFirstValueValid = checkValueLimit(firstNumericValue, MAX_ALLOWED_VALUE);
    const isSecondValueValid = checkValueLimit(secondNumericValue, MAX_ALLOWED_VALUE);

    if (isFirstValueValid && isSecondValueValid) {
        console.log('Yay!');
    } else {
        console.log(':(');
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
