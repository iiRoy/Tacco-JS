process.stdin.resume();
process.stdin.setEncoding('utf8');

let receivedData = '';

process.stdin.on('data', function (dataSegment) {
  receivedData += dataSegment;
});

process.stdin.on('end', function () {
  const parsedValues = receivedData.split(' ');
  console.log(parsedValues[0] * parsedValues[1] / 3.305785);
});
