process.stdin.resume();
process.stdin.setEncoding('utf8');

let accumulatedInput = '';

process.stdin.on('data', (inputChunk) => {
  accumulatedInput += inputChunk;
});

process.stdin.on('end', () => {
  const allReceivedLines = accumulatedInput.split(/\r?\n/);
  const primaryDatum = allReceivedLines[0];

  const designatedValues = new Set(['3', '5', '7']);

  if (designatedValues.has(primaryDatum)) {
    console.log("YES");
  } else {
    console.log("NO");
  }
});
