const fs = require("fs");

const values = fs.readFileSync("/dev/stdin", "utf8")
    .trim()
    .split(/[\s,]+/)
    .map(Number);

const pairs = [];
for (let index = 0; index < values.length; index += 2) {
    pairs.push({
        left: values[index],
        right: values[index + 1]
    });
}

const totals = pairs.reduce(function (accumulator, pair) {
    accumulator.weightedSum += pair.left * pair.right;
    accumulator.rightSum += pair.right;
    return accumulator;
}, {
    weightedSum: 0,
    rightSum: 0
});

const roundedAverage = Math.trunc(totals.rightSum / (values.length * 2) + 0.5);

console.log(totals.weightedSum + "\n" + roundedAverage);