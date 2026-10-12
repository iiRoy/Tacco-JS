const fileSystem = require("fs");
const dataLine = fileSystem.readFileSync(0).toString();
const numericTokens = dataLine.split(" ").map(Number);

const arraySize = numericTokens[0];
const overwriteCount = numericTokens[1];
const overwriteValue = numericTokens[2];

const finalSequence = Array.from({ length: arraySize }, (_, index) =>
  index < overwriteCount ? overwriteValue : 7
);

console.log(finalSequence.join(" "));
