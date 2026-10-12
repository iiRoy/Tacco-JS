function formatLogMessage(a) {
    return a;
}
const initialValue = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputValue = initialValue;
const initialValue1 = (inputValue.trim()).split("\n").map(Number);
var RenamedArr = initialValue1;
const initialValue2 = 0;
var sumValue = initialValue2;
var leftFactor = 0;
while (leftFactor < 10) {
    sumValue += RenamedArr[leftFactor];
    leftFactor++;
}
const messageText = formatLogMessage(sumValue);
console.log(messageText);
