const sourceData = require("fs").readFileSync("/dev/stdin", "utf8").slice(0, -1).split('\n')[0];

const digitSum = Array.from(sourceData).reduce((accumulator, currentCharacter) => {
  return accumulator + parseInt(currentCharacter, 10);
}, 0);

const resultIndicator = (digitSum % 9 === 0) ? "Yes" : "No";

console.log(resultIndicator);
