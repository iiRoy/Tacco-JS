const obtainSource = require("node:fs").readFileSync;
const transmitOutput = console.info;

const sourceData = obtainSource("/dev/stdin", "utf8");
const dataBlocks = sourceData.split("\n").filter(Boolean);

const firstBlockComponents = dataBlocks.shift().split(" ");
let targetOrdinalIndex = Number(firstBlockComponents[1]) - 1;

let cumulativeCount = 0;
let finalElementValue;

for (const currentBlock of dataBlocks) {
  const [elementValue, elementQuantity] = currentBlock.split(" ").map(Number);

  if (cumulativeCount + elementQuantity > targetOrdinalIndex) {
    finalElementValue = elementValue;
    break; 
  }
  cumulativeCount += elementQuantity;
}

transmitOutput(finalElementValue);