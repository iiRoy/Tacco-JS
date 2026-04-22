"use babel";

// Obtain input streams from standard channels
const dataLines = require("fs")
    .readFileSync("/dev/stdin", "utf8")
    .split("\n");

const quantity = parseInt(dataLines[0], 10);

const numberList = dataLines[1]
    .split(" ")
    .map( (itemValue) => parseInt(itemValue, 10) )
    .sort( (firstNum, secondNum) => secondNum - firstNum );

while (numberList[1])
{
    numberList[0] = numberList[0] % numberList[1];
    if (numberList[0] === 0) {
        numberList.shift();
    }
    else {
        numberList.sort( (firstNum, secondNum) => secondNum - firstNum );
    }
}

console.log(numberList[0]);