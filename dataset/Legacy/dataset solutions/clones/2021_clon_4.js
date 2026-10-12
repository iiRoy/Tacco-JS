var inputSource = require('fs').readFileSync('/dev/stdin', 'utf8');
var numericInput = parseInt(inputSource);

function calculateValue(currentAmount) {
    if (currentAmount < 5) {
        return 0;
    }

    if (currentAmount >= 500) {
        return 1000 + calculateValue(currentAmount - 500);
    } else {
        return 5 + calculateValue(currentAmount - 5);
    }
}

console.log(calculateValue(numericInput));
