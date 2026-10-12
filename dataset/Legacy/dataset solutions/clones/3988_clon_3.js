const fileSystemModule = require('fs');
const rawData = fileSystemModule.readFileSync("/dev/stdin", "utf8");

const inputDelimiter = " ";
const boundsArray = rawData.toString().split(inputDelimiter);

const lowerBound = Number(boundsArray[0]);
const upperBound = Number(boundsArray[1]);

let palindromeCount = 0;

function checkFiveDigitPalindrome(numberString) {
  const firstChar = numberString[0];
  const secondChar = numberString[1];
  const fourthChar = numberString[3];
  const fifthChar = numberString[4];

  return firstChar === fifthChar && secondChar === fourthChar;
}

for (let currentNum = lowerBound; currentNum < upperBound; currentNum++) {
  const numAsString = currentNum.toString();

  if (checkFiveDigitPalindrome(numAsString)) {
    palindromeCount++;
  }
}

console.log(palindromeCount);
