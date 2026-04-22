function processInputData(dataStream) {
  const relevantLines = dataStream.split("\n");
  const numberTokens = relevantLines[1].split(" ");
  
  const distinctElements = new Set(numberTokens);
  const uniqueElementCount = distinctElements.size;
  
  const finalValue = (uniqueElementCount % 2 === 0) ? (uniqueElementCount - 1) : uniqueElementCount;
  
  console.log(finalValue);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));