const rawText = require("fs").readFileSync("/dev/stdin", "utf8");

const parsedLines = rawText.split("\n");

const countVal = Number(parsedLines[0]);
const firstArr = parsedLines[1].split(" ").map(Number);
const secondArr = parsedLines[2].split(" ").map(Number);
const thirdArr = parsedLines[3].split(" ").map(Number);

const initialSum = secondArr.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

const finalTotal = Array.from({ length: countVal - 1 }).reduce((currentAccumulatedSum, _, idx) => {
    const currentElementA = firstArr[idx];
    const nextElementA = firstArr[idx + 1];
    if (nextElementA - currentElementA === 1) {
        return currentAccumulatedSum + thirdArr[idx];
    }
    return currentAccumulatedSum;
}, initialSum);

console.log(finalTotal);
