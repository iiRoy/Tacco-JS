function checkPrimality(value) {
    if (value < 2) return false;
    if (value === 2) return true;
    if (value % 2 === 0) return false;

    const boundary = Math.floor(Math.sqrt(value));
    for (let divisor = 3; divisor <= boundary; divisor += 2) {
        if (value % divisor === 0) return false;
    }
    return true;
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const dataRows = fileContent.trim().split('\n');

for (const currentLine of dataRows) {
    const targetNumber = +currentLine;

    let previousPrime;
    let nextPrime;

    for (let candidate = targetNumber - 1; candidate >= 2; candidate--) {
        if (checkPrimality(candidate)) {
            previousPrime = candidate;
            break;
        }
    }

    for (let candidate = targetNumber + 1; ; candidate++) {
        if (checkPrimality(candidate)) {
            nextPrime = candidate;
            break;
        }
    }

    console.log(previousPrime, nextPrime);
}
