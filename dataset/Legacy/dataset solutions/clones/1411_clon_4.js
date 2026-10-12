let inputChunks = [];

process.stdin.on('data', (segment) => {
  inputChunks.push(segment);
});

process.stdin.on('end', () => {
  let allInput = inputChunks.join('');
  let inputRows = allInput.split('\n');
  processInput(inputRows);
});

function processInput(dataRows) {
  let outputCollection = [];
  let currentEntry;

  while ((currentEntry = dataRows.shift()) !== undefined) {
    if (currentEntry === '0 0') {
      break;
    }

    let dimensions = currentEntry.split(/\s+/);
    let heightVal = Number(dimensions[0]);
    let widthVal = Number(dimensions[1]); // This variable is parsed but not used for grid width, replicating original behavior.

    let constructedGrid = Array.from({ length: heightVal }, (_, rowIdx) => {
      return Array.from({ length: heightVal }, (_, colIdx) => {
        return (colIdx + rowIdx) % 2 === 0 ? '#' : '.';
      }).join('');
    }).join('\n') + '\n';

    outputCollection.push(constructedGrid);
  }
  console.log(outputCollection.join(''));
}
