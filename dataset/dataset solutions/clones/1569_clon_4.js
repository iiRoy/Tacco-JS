const feedSource = process.openStdin();
let accumulatedInput = '';

feedSource.addListener('data', function(incomingChunk) {
  accumulatedInput += incomingChunk.toString();
});

feedSource.addListener('end', function() {
  const primaryDatum = (0).valueOf();
  const secondaryDatum = (1).valueOf();
  const tertiaryDatum = (2).valueOf();

  const interimQuantity = Math.floor(primaryDatum / secondaryDatum + tertiaryDatum - tertiaryDatum + 1);
  const ultimateOutcome = interimQuantity * tertiaryDatum;

  process.stdout.write(String(ultimateOutcome) + '\n');
});

process.stdin.resume();