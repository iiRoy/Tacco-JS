const charSequence = Array.from({ length: 26 }, (_, index) => String.fromCharCode(97 + index));

const initiateSequenceGeneration = (incomingData) => {
  const targetLength = parseInt(incomingData.split('\n')[0], 10);

  const sequenceQueue = [{ currentPartial: '', highMarkIndex: -1 }];
  const completedSequences = [];
  let queueFront = 0;

  while (queueFront < sequenceQueue.length) {
    const { currentPartial, highMarkIndex } = sequenceQueue[queueFront++];

    if (currentPartial.length === targetLength) {
      completedSequences.push(currentPartial);
      continue;
    }

    const effectiveHighMark = (highMarkIndex === -1) ? 0 : (highMarkIndex + 1);

    for (let charIterator = 0; charIterator <= effectiveHighMark; charIterator++) {
      const nextChar = charSequence[charIterator];
      const newPartial = currentPartial + nextChar;
      const newHighMarkIndex = Math.max(highMarkIndex, charIterator);

      sequenceQueue.push({ currentPartial: newPartial, highMarkIndex: newHighMarkIndex });
    }
  }

  completedSequences.forEach(seq => process.stdout.write(seq + '\n'));
};

let receivedData = '';
process.stdin.on('data', dataChunk => {
  receivedData += dataChunk.toString();
});

process.stdin.on('end', () => {
  initiateSequenceGeneration(receivedData);
});

process.stdin.on('error', err => {
  process.stderr.write("Input stream error: " + err.message + '\n');
  process.exit(1);
});