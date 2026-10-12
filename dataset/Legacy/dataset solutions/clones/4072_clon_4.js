const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8');

const isSquareNumber = (val) => {
    if (val < 0) {
        return false;
    }
    if (val === 0 || val === 1) {
        return true;
    }

    let lowerBound = 1;
    let upperBound = val;

    while (lowerBound <= upperBound) {
        const midPoint = Math.floor(lowerBound + (upperBound - lowerBound) / 2);
        const midSquare = midPoint * midPoint;

        if (midSquare === val) {
            return true;
        } else if (midSquare < val) {
            lowerBound = midPoint + 1;
        } else {
            upperBound = midPoint - 1;
        }
    }
    return false;
};

const targetValue = parseInt(rawInput.replace(' ', ''), 10);

console.log(isSquareNumber(targetValue) ? 'Yes' : 'No');
