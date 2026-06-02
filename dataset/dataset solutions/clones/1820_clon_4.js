const fs = require("fs");

function isPrimeNumber(value) {
    if (value < 2n) return false;
    if (value === 2n) return true;
    if (value % 2n === 0n) return false;

    for (let divisor = 3n; divisor * divisor <= value; divisor += 2n) {
        if (value % divisor === 0n) return false;
    }

    return true;
}

function exponentInside(number, base) {
    let exponent = 0;

    while (number % base === 0n) {
        exponent++;
        number /= base;
    }

    return exponent;
}

function completeLayers(exponent) {
    let layers = 0;
    let required = 1;

    while (exponent >= required) {
        exponent -= required;
        layers++;
        required++;
    }

    return layers;
}

function removePower(number, base, exponent) {
    for (let i = 0; i < exponent; i++) {
        number /= base;
    }

    return number;
}

function solve(input) {
    let remaining = BigInt(input);

    if (remaining === 1n) return "0";

    let total = 0;
    let candidate = 2n;

    while (candidate * candidate <= remaining || candidate === remaining) {
        if (isPrimeNumber(candidate)) {
            const exponent = exponentInside(remaining, candidate);
            const layers = completeLayers(exponent);

            if (layers > 0) {
                total += layers;
                const consumed = (layers * (layers + 1)) / 2;
                remaining = removePower(remaining, candidate, consumed);
            }
        }

        candidate++;
    }

    return String(total === 0 ? 1 : total);
}

console.log(solve(fs.readFileSync("/dev/stdin", "utf8")));