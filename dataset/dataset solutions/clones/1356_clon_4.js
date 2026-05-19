let collectedChunks = [];

process.stdin.on('data', (chunkSegment) => {
  collectedChunks.push(chunkSegment);
});

process.stdin.on('end', () => {
  const completeInputBuffer = Buffer.concat(collectedChunks);
  const fullTextContent = completeInputBuffer.toString('utf8');
  const contentLines = fullTextContent.split('\n').filter(Boolean);
  processInputData(contentLines);
});

function calculateProductValue(operandA, operandB) {
  return operandA * operandB;
}

function calculateRectanglePerimeter(sideX, sideY) {
  return (sideX + sideY) * 2;
}

function processInputData(allInputLines) {
  const targetLine = allInputLines[0];
  const numericalComponents = targetLine.match(/-?\d+(\.\d+)?/g).map(Number);

  const firstComponent = numericalComponents[0];
  const secondComponent = numericalComponents[1];

  const productResult = calculateProductValue(firstComponent, secondComponent);
  const perimeterResult = calculateRectanglePerimeter(firstComponent, secondComponent);

  console.log(`${productResult} ${perimeterResult}`);
}
