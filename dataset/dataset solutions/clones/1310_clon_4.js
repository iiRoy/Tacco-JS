const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8').split(/\n/);

sourceData.every(function(currentLine) {
    if (currentLine === '0') {
        return false;
    }

    const digitSum = currentLine.split('').reduce(function(accumulator, currentDigitChar) {
        return accumulator + Number(currentDigitChar);
    }, 0);

    console.log(digitSum);

    return true;
});
