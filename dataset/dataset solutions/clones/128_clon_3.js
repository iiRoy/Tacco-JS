const fileSystem = require("fs");

const standardInputPath = "/dev/stdin";
const textEncoding = "utf8";

const rawInputContent = fileSystem.readFileSync(standardInputPath, textEncoding);

const inputLines = rawInputContent.split('\n');

inputLines.map(function(currentLineString) {
    const lineNumericValue = parseInt(currentLineString, 10);

    const foundPowersOfTwo = [];

    const highestBitIndex = 9;

    for (let bitIndex = highestBitIndex; bitIndex >= 0; bitIndex--) {
        const powerValue = 1 << bitIndex;

        if ((lineNumericValue & powerValue) !== 0) {
            foundPowersOfTwo.push(powerValue);
        }
    }

    if (foundPowersOfTwo.length > 0) {
        console.log(foundPowersOfTwo.join(' '));
    }
});
