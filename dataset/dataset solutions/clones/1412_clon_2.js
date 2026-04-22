function processInputData(inputRows)
{
  for (let rowIndex = 0;   ; rowIndex++)
  {
    if (inputRows[rowIndex] === '0 0')
    {
      break;
    }
    
    const dimensionStrings = inputRows[rowIndex].split(/\s+/);
    const heightVal = Number.parseInt(dimensionStrings[0], 10);
    const widthVal = Number.parseInt(dimensionStrings[1], 10);

    let gridPattern = Array.from({ length: heightVal });
    for (let rowCoord = 0; rowCoord < gridPattern.length; rowCoord++)
    {
      gridPattern[rowCoord] = Array.from({ length: widthVal });
      for (let colCoord = 0; colCoord < gridPattern[rowCoord].length; colCoord++)
      {
        gridPattern[rowCoord][colCoord] = (colCoord + rowCoord) % 2 === 0 ? '#' : '.';
      }
      gridPattern[rowCoord] = gridPattern[rowCoord].join('') + '\n';
    }
    gridPattern = gridPattern.join('');
    console.log(gridPattern);
  }
}

const dataBuffer = [];
process.stdin.on('data', function(receivedSegment) {
  dataBuffer.push(receivedSegment);
});
process.stdin.on('end', function() {
  const processedRows = dataBuffer.join('').split('\n');
  processInputData(processedRows);
});