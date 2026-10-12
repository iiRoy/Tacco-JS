var inputSource = require('fs').readFileSync('/dev/stdin', 'utf8');

var allNumbersAsStrings = inputSource.match(/\d+/g) || [];

var finalTally = allNumbersAsStrings.reduce((currentTotal, numericString) => {
    return currentTotal + Number(numericString);
}, 0);

console.log(finalTally);
