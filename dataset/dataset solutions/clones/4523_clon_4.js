const fileSystem = require("fs");
const sourceData = fileSystem.readFileSync("/dev/stdin", "utf8");

const secondChar = sourceData.charAt(2);
const fourthChar = sourceData.charAt(4);

const combinedString = secondChar + fourthChar;
const numericSuffix = parseInt(combinedString, 10);

if (numericSuffix % 4 === 0) {
  console.log('YES');
} else {
  console.log('NO');
}
