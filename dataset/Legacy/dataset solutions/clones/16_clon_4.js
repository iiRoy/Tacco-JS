let receivedData = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  receivedData += chunk;
});

process.stdin.on('end', () => {
  const allInputLines = receivedData.trim().split('\n');

  const caseCountStr = allInputLines[0];
  const caseCount = Number(caseCountStr);

  if (caseCount > 1000) {
    return;
  }

  for (const currentDataEntry of allInputLines.slice(1)) {
    const sideValues = currentDataEntry.split(' ').map(Number);

    const [s1, s2, s3] = sideValues;

    if (s1 < 0 || s1 > 1000 || s2 < 0 || s2 > 1000 || s3 < 0 || s3 > 1000) {
      return;
    }

    sideValues.sort((valA, valB) => valB - valA);

    const [longestSide, otherSideA, otherSideB] = sideValues;

    if (longestSide * longestSide === otherSideA * otherSideA + otherSideB * otherSideB) {
      console.log('YES');
    } else {
      console.log('NO');
    }
  }
});
