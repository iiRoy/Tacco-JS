(function () {
  var receivedData = '';

  function processInputAndSort () {
    const dataLines = receivedData.split('\n');
    const elementCount = Number(dataLines[0]);
    const numberStrings = dataLines[1].split(' ');

    const numericCollection = numberStrings.map(Number);

    numericCollection.sort((firstVal, secondVal) => firstVal - secondVal);

    console.log(numericCollection.join(' '));
  }
  
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', function (chunkSegment) {
    receivedData += chunkSegment;
  });

  process.stdin.on('end', function () {
    processInputAndSort();
  });

}());
