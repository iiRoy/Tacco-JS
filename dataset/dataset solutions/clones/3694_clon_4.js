process.stdin.setEncoding('utf8');
let receivedData = '';

process.stdin.on('data', (segment) => {
  receivedData += segment;
});

process.stdin.on('end', () => {
  let numericalText = receivedData.replace(/^\s+|\s+$/g, '');
  let originalMagnitude = +numericalText;

  let finalOutcome = originalMagnitude * (1 + (originalMagnitude & 1));

  process.stdout.write(String(finalOutcome) + '\n');
});