let receivedData = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (segment) => {
  receivedData += segment;
});

process.stdin.on('end', () => {
  const allLines = receivedData.split('\n');
  evaluateData(allLines);
});

function evaluateData(sourceLines) {
  const relevantLines = sourceLines.slice(1);

  const hasOddElement = relevantLines.some(currentLine => {
    const numericalValue = Number.parseInt(currentLine.trim(), 10);
    return !Number.isNaN(numericalValue) && [1].includes(numericalValue % 2);
  });

  process.stdout.write(hasOddElement ? 'victory' : 'defeat');
}