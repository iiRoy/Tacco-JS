const sourceData = require("fs").readFileSync("/dev/stdin", "utf8");

const numericStrings = sourceData.split(' ');

const totalValue = numericStrings.reduce((currentTotal, currentString) => {
    return currentTotal + Number(currentString);
}, 0);

const averageValue = totalValue / numericStrings.length;

console.log(Math.ceil(averageValue));
