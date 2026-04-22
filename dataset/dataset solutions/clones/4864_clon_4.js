const rawInput = require("fs").readFileSync("/dev/stdin", "utf8").trim();

const processedGridData = rawInput.split('\n').slice(1).flatMap((lineText, rIndex) =>
    lineText.split(' ').map((cellValue, cIndex) => ({
        val: cellValue,
        posR: rIndex,
        posC: cIndex
    }))
);

const locatedItem = processedGridData.find(datum => datum.val === "snuke");

const displayRow = locatedItem.posR + 1;
const displayColChar = String.fromCharCode('A'.charCodeAt(0) + locatedItem.posC);

console.log(displayColChar + displayRow);