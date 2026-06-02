const rawInput = require("fs").readFileSync("/dev/stdin", "utf8");

let partsArray = [];
let currentSegment = "";

for (let charIndex = 0; charIndex < rawInput.length; charIndex++) {
    if (rawInput[charIndex] === ' ') {
        partsArray.push(currentSegment);
        currentSegment = "";
    } else {
        currentSegment += rawInput[charIndex];
    }
}
partsArray.push(currentSegment);

let operandOne;
if (partsArray.length > 0) {
    operandOne = Number(partsArray[0]);
} else {
    operandOne = 0;
}

let operandTwo;
if (partsArray.length > 1) {
    operandTwo = Number(partsArray[1]);
} else {
    operandTwo = 0;
}

const calculatedSum = operandOne + operandTwo;

if (calculatedSum >= 10) {
    console.log("error");
} else {
    console.log(calculatedSum);
}
