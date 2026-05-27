function countTrailingDigits(val, currentCount = 0) {
    if (val === 0) {
        return 1;
    }
    if (val % 10 === 0) {
        return countTrailingDigits(val / 10, currentCount + 1);
    }
    return currentCount;
}

function processInputData(rawInput) {
    const initialValue = parseInt(rawInput, 10);

    const totalTrailingZeros = Array.from(
        {
            length: Math.floor((initialValue + 1) / 2)
        },
        (_, index) => initialValue - index * 2
    ).reduce((accumulator, currentValue) => {
        return accumulator + countTrailingDigits(currentValue);
    }, 0);

    console.log(totalTrailingZeros);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
