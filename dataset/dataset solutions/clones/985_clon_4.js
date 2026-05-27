process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (inputChunk) {
  const inputLines = inputChunk.toString().split('\n');
  const elementCount = parseInt(inputLines[0], 10);
  const dataElements = inputLines[1].split(' ');

  console.log(dataElements.join(" "));

  Array.from({ length: elementCount - 1 }, (_, indexOffset) => indexOffset + 1).forEach(currentElementIndex => {
    const valueToPlace = dataElements[currentElementIndex];
    const numericValueToPlace = parseFloat(valueToPlace);

    let targetInsertionPosition = currentElementIndex;

    for (let prefixScanIndex = 0; prefixScanIndex < currentElementIndex; prefixScanIndex++) {
      if (parseFloat(dataElements[prefixScanIndex]) > numericValueToPlace) {
        targetInsertionPosition = prefixScanIndex;
        break;
      }
    }

    const [extractedElement] = dataElements.splice(currentElementIndex, 1);
    dataElements.splice(targetInsertionPosition, 0, extractedElement);

    console.log(dataElements.join(" "));
  });
});
