let dataBuffer = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunkOfData) => {
  dataBuffer += chunkOfData;
});

process.stdin.on('end', () => {
  processApplicationLogic();
});

function* generateInputLines(rawTextContent) {
  const lineCollection = rawTextContent.trim().split(/\r?\n/);
  for (const singleLine of lineCollection) {
    yield singleLine;
  }
}

let lineIterator;

function extractNextNumericValue() {
  const { value: currentLine, done: isFinished } = lineIterator.next();
  if (isFinished) {
    throw new Error("Data source exhausted: No more entries available.");
  }
  return Number.parseInt(currentLine, 10);
}

function presentResult(computedValue) {
  console.log(computedValue);
}

function processApplicationLogic() {
  lineIterator = generateInputLines(dataBuffer);

  const primaryValue = extractNextNumericValue();

  const divisionResult = Math.floor(primaryValue / 11);
  const moduloResult = primaryValue % 11;

  const remainderEffectMap = [0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2];
  const remainderContribution = remainderEffectMap[moduloResult];

  const finalComputedValue = (divisionResult * 2) + remainderContribution;

  presentResult(finalComputedValue);
}