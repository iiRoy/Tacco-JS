let accumulatedData = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (incomingChunk) => {
  accumulatedData += incomingChunk;
});

process.stdin.on('end', () => {
  const extractedNumbers = accumulatedData.match(/[0-9]+/g);
  
  const totalValue = extractedNumbers
    ? extractedNumbers.reduce((currentTotal, numberString) => currentTotal + Number(numberString), 0)
    : 0;
    
  console.log(totalValue);
});
