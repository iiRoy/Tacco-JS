process.stdin.resume();
process.stdin.setEncoding('utf8');

let receivedText = '';

process.stdin.on('data', incomingChunk => {
  receivedText += incomingChunk;
});

process.stdin.on('end', () => {
  let processedSegments = receivedText.replace(/\s*$/g, '').split(' ');
  performCalculationAndDisplay(processedSegments);
});

function performCalculationAndDisplay(numericStrings) {
  let currentProduct = 1;

  for (const strValue of numericStrings) {
    currentProduct *= strValue;
  }

  process.stdout.write(currentProduct.toString());
}
