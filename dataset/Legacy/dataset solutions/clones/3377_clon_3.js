function processInputData(dataLines) {
  var firstLineVal = parseInt(dataLines[0]);

  var hasOddNumber = false;

  const MODULO_CHECK_VALUE = 2;

  const checkIsOdd = (numberToCheck) => {
    return numberToCheck % MODULO_CHECK_VALUE === 1;
  };

  if (dataLines.length > 1) {
    const subsequentLines = dataLines.slice(1);
    subsequentLines.forEach(function(currentLineContent) {
      var currentParsedNumber = parseInt(currentLineContent);

      if (checkIsOdd(currentParsedNumber)) {
        hasOddNumber = true;
      }
    });
  }

  console.log(hasOddNumber ? 'first' : 'second');
}

function parseLineOfNumbers(inputString) {
  var stringNumberArray = inputString.split(' ');
  var parsedNumberResults = stringNumberArray.map(function(strValue) {
    return parseInt(strValue);
  });
  return parsedNumberResults;
}

var rawDataBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(receivedChunk) {
  rawDataBuffer += receivedChunk;
});
process.stdin.on('end', function() {
  var processedInputLines = rawDataBuffer.split('\n');
  processInputData(processedInputLines);
});
