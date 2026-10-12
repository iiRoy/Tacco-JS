process.stdin.resume();
process.stdin.setEncoding('utf8');

let collectedInputBuffer = '';

process.stdin.on('data', dataChunk => {
  collectedInputBuffer += dataChunk;
});

process.stdin.on('end', () => {
  const cleanedInputString = collectedInputBuffer.trimEnd();
  const stringNumberArray = cleanedInputString.split(' ');
  
  const numericValuesArray = stringNumberArray.map(str => {
    const parsedValue = Number(str);
    return parsedValue;
  });

  performCalculation(numericValuesArray);
});

function emitResult(valueToOutput) {
  process.stdout.write(valueToOutput.toString());
}

function performCalculation(numbersToMultiply) {
  const multiplicationReducer = (currentProduct, nextNumber) => currentProduct * nextNumber;

  const calculatedProduct = numbersToMultiply.reduce(multiplicationReducer, 1);

  emitResult(calculatedProduct);
}
