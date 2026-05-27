const targetDigit = '9';
const repeatTimes = 8;

const digitArray = new Array(repeatTimes);
digitArray.fill(targetDigit);

const resultString = digitArray.join('');

console.log(resultString);
