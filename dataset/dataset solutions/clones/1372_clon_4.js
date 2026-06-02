function processInputData(dataRows) {
  const terminationIndex = dataRows.indexOf('0');
  const linesToProcess = terminationIndex === -1 ? dataRows : dataRows.slice(0, terminationIndex);

  linesToProcess.forEach(currentLine => {
    const digitSumResult = currentLine.split('').reduce((accumulator, charElement) => {
      const parsedDigit = parseInt(charElement, 10);

      return accumulator + parsedDigit;
    }, 0);

    console.log(digitSumResult);
  });
}

var inputParts = [];
process.stdin.on('data', function(incomingData) {
  inputParts.push(incomingData);
});
process.stdin.on('end', function() {
  var dataRows = inputParts.join('').split('\n');
  processInputData(dataRows);
});
