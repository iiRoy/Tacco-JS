let totalSum = 0;

process.stdin.resume();
process.stdin.setEncoding('utf8');

function processInputChunk(receivedData) {
  const numericStrings = receivedData.match(/[0-9]+/g);
  if (numericStrings) {
    for (let currentNumString of numericStrings) {
      const parsedNumber = Number(currentNumString);
      totalSum += parsedNumber;
    }
  }
}

process.stdin.on('data', processInputChunk);

process.stdin.on('end', function() {
  console.log(totalSum);
});
