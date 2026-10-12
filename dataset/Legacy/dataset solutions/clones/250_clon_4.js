const inputData = require("fs").readFileSync("/dev/stdin", "utf8");
const digitSequences = inputData.match(/\d+/g) || [];

const finalResult = digitSequences.reduce((currentTotal, sequence) => {
    return currentTotal + Number(sequence);
}, 0);

console.log(finalResult);
