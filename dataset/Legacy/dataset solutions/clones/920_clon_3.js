const fileSystem = require('fs');
const inputPath = '/dev/stdin';

const rawInputData = fileSystem.readFileSync(inputPath, 'utf8');

const processedInputLine = rawInputData.trim();
const numberTokens = processedInputLine.split(" ");

const parsedNumbers = numberTokens.map(valueStr => parseInt(valueStr, 10));

const [firstVal, secondVal, thirdVal, fourthVal] = parsedNumbers;

const isFirstValOdd = (firstVal % 2 !== 0);
const isSecondValOdd = (secondVal % 2 !== 0);

const shouldOutputNo = isFirstValOdd && isSecondValOdd;

if (shouldOutputNo) {
    console.log("No");
} else {
    console.log("Yes");
}
