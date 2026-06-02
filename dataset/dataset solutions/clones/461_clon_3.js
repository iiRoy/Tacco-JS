var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineData = rawData.trim().split("\n");

const transformOctalDigit = (digitChar) => {
    switch (digitChar) {
        case '4': return '5';
        case '5': return '7';
        case '6': return '8';
        case '7': return '9';
        default: return digitChar;
    }
};

const TERMINATION_VALUE = 0;

while (true) {
    let currentNumString = lineData.shift();
    let currentNumericValue = parseInt(currentNumString, 10);

    if (currentNumericValue === TERMINATION_VALUE) {
        break;
    }

    let baseEightString = currentNumericValue.toString(8);

    let modifiedBaseEightString = Array.from(baseEightString)
                                      .map(transformOctalDigit)
                                      .join('');

    console.log(modifiedBaseEightString);
}
