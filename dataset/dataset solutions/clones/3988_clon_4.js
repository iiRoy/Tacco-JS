const fs = require('fs');
const rawInput = fs.readFileSync("/dev/stdin", "utf8");
const boundaryStrings = rawInput.toString().split(" ");
const startValue = parseInt(boundaryStrings[0]);
const endValue = parseInt(boundaryStrings[1]);

const palindromeCount = Array.from({ length: endValue - startValue }, (_, index) => startValue + index)
  .filter(currentNumber => {
    if (currentNumber < 10000 || currentNumber > 99999) {
      return false;
    }

    const firstDigit = Math.floor(currentNumber / 10000);
    const secondDigit = Math.floor((currentNumber % 10000) / 1000);
    const fourthDigit = Math.floor((currentNumber % 100) / 10);
    const fifthDigit = currentNumber % 10;

    return firstDigit === fifthDigit && secondDigit === fourthDigit;
  }).length;

console.log(palindromeCount);
