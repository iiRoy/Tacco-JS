function calculateAverage(dataArray) {
  return (dataArray[0] + dataArray[1]) / 2;
}

let receivedData = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(dataChunk) {
  receivedData += dataChunk;
});
process.stdin.on('end', function() {
  let processedInput = receivedData.split(' ');
  console.log(calculateAverage(processedInput));
});
