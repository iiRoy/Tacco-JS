function processProblemData(inputLinesArray) {
  const configLineParts = inputLinesArray[0].split(' ');

  const totalItemsCount = parseInt(configLineParts[0], 10);
  const requiredHeight = parseInt(configLineParts[1], 10);
  const requiredWidth = parseInt(configLineParts[2], 10);

  let eligibleItemsCounter = 0;

  const numberOfDataLines = inputLinesArray.length;

  const parseDimensions = (parts) => {
    const height = parseInt(parts[0], 10);
    const width = parseInt(parts[1], 10);
    return { height, width };
  };

  for (let currentLineIndex = 1; currentLineIndex < numberOfDataLines; currentLineIndex++) {
    const itemDimensionsParts = inputLinesArray[currentLineIndex].split(' ');
    
    const { height: itemActualHeight, width: itemActualWidth } = parseDimensions(itemDimensionsParts);
    
    const meetsHeightRequirement = itemActualHeight >= requiredHeight;
    const meetsWidthRequirement = itemActualWidth >= requiredWidth;

    if (meetsHeightRequirement && meetsWidthRequirement) {
      eligibleItemsCounter++;
    }
  }

  console.log(eligibleItemsCounter);
}

let fullInputBuffer = '';

(function setupInputProcessing() {
  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  process.stdin.on('data', function(receivedChunk) {
    fullInputBuffer += receivedChunk;
  });

  process.stdin.on('end', function() {
    const processedInputLines = fullInputBuffer.split('\n');
    processProblemData(processedInputLines);
  });
})();
