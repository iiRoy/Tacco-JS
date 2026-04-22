(function () {
  let accumulatedData = '';

  const processIncomingData = () => {
    const dataLines = accumulatedData.split('\n');
    const [ countStr, numbersStr ] = dataLines;

    const expectedCount = parseInt(countStr, 10); 
    
    const numericValues = numbersStr.split(' ').map(Number);

    numericValues.sort((valA, valB) => valA - valB);

    console.log(numericValues.join(' '));
  };

  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (dataFragment) => {
    accumulatedData += dataFragment;
  });

  process.stdin.on('end', () => {
    processIncomingData();
  });
}());