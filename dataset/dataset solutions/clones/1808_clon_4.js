function processInputData(rawDataStream) {
  let delimiterPosition = rawDataStream.indexOf(' ');
  let firstSegment = rawDataStream.substring(0, delimiterPosition);
  let secondSegment = rawDataStream.substring(delimiterPosition + 1);

  let resultValue = eval(firstSegment + '*' + secondSegment);

  process.stdout.write(String(resultValue) + '\n');
}

processInputData(require('node:fs').readFileSync('/dev/stdin', 'utf8'));