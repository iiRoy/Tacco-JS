var cumulativeSum = 0;
const fileSystemModule = require("fs");
const fileContentBuffer = fileSystemModule.readFileSync("/dev/stdin", "utf8");
const numberStringsCollection = fileContentBuffer.match(/\d+/g);

// If numberStringsCollection is null (no matches), iterating over it will throw a TypeError,
// which preserves the original behavior of calling .forEach on a null result.
for (const numericString of numberStringsCollection) {
    const currentParsedValue = parseInt(numericString, 10);
    cumulativeSum += currentParsedValue;
}

console.log(cumulativeSum);
