function processData(rawText) {
  const contentParts = rawText.split('\n');
  const exclusionCount = parseInt(contentParts[0].split(' ')[1], 10);
  const dataPoints = contentParts[1].split(' ').map(Number);
  
  const ascendingOrder = dataPoints.sort((valA, valB) => valA - valB);
  
  const elementsToSum = ascendingOrder.slice(0, ascendingOrder.length - exclusionCount);
  
  const finalTally = elementsToSum.reduce((accumulator, item) => accumulator + item, 0);
  
  console.log(finalTally);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));