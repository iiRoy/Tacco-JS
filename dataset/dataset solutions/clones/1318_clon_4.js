const inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let receivedPayloads = [];

inputProcessor.on('line', (individualSegment) => {
  receivedPayloads.push(individualSegment);
});

inputProcessor.on('close', () => {
  const primarySource = receivedPayloads[0];
  const secondaryQuery = receivedPayloads[1];

  const discernPresence = (referenceString, targetPattern) => {
    const coercedPattern = String(targetPattern); // Mimic String.prototype.indexOf's coercion
    if (coercedPattern.length === 0) {
      return 0;
    }
    if (coercedPattern.length > referenceString.length) {
      return -1;
    }

    for (let currentOffset = 0; currentOffset <= referenceString.length - coercedPattern.length; currentOffset++) {
      let candidateMatch = true;
      for (let charIndex = 0; charIndex < coercedPattern.length; charIndex++) {
        if (referenceString[currentOffset + charIndex] !== coercedPattern[charIndex]) {
          candidateMatch = false;
          break;
        }
      }
      if (candidateMatch) {
        return currentOffset;
      }
    }
    return -1;
  };

  const augmentedSource = primarySource + primarySource;

  if (discernPresence(augmentedSource, secondaryQuery) !== -1) {
    process.stdout.write("Yes\n");
  } else {
    process.stdout.write("No\n");
  }
});