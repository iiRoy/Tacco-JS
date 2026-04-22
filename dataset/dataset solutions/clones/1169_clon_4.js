let dataBuffer = '';
let processingComplete = false;

const squaredDifference = (valueA, valueB) => {
  const diff = valueA - valueB;
  return diff * diff;
};

process.stdin.on('data', (incomingSegment) => {
  if (processingComplete) {
    return;
  }
  dataBuffer += incomingSegment.toString('utf8');

  const newlineIndex = dataBuffer.indexOf('\n');
  if (newlineIndex !== -1) {
    const inputLine = dataBuffer.substring(0, newlineIndex).trim();
    processingComplete = true;

    process.stdin.pause();
    process.stdin.removeAllListeners('data');
    process.stdin.removeAllListeners('end');

    const numberStrings = inputLine.split(/\s+/);
    const [firstX, firstY, secondX, secondY] = numberStrings.map(parseFloat);

    const xDistanceSquared = squaredDifference(firstX, secondX);
    const yDistanceSquared = squaredDifference(firstY, secondY);

    const finalDistance = Math.pow(xDistanceSquared + yDistanceSquared, 0.5);

    process.stdout.write(finalDistance.toFixed(8) + '\n');
    process.exit(0);
  }
});

process.stdin.on('end', () => {
  if (!processingComplete && dataBuffer.trim() !== '') {
    const inputLine = dataBuffer.trim();
    const numberStrings = inputLine.split(/\s+/);
    const [firstX, firstY, secondX, secondY] = numberStrings.map(parseFloat);

    const xDistanceSquared = squaredDifference(firstX, secondX);
    const yDistanceSquared = squaredDifference(firstY, secondY);

    const finalDistance = Math.pow(xDistanceSquared + yDistanceSquared, 0.5);

    process.stdout.write(finalDistance.toFixed(8) + '\n');
    process.exit(0);
  } else if (!processingComplete) {
     process.exit(1);
  }
});

process.stdin.resume();