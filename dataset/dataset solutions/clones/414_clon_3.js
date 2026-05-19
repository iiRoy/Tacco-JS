const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedLines = rawData.trim().split('\n');

const VALID_HUES = ['r','g','b'];

class SegmentSequence {
  constructor(sequenceIdentifier, elapsedTime) {
    this.sequenceIdentifier = sequenceIdentifier;
    this.elapsedTime = elapsedTime;
  }

  _determineReplacementHue(char1, char2) {
    return VALID_HUES.find(hue => hue !== char1 && hue !== char2);
  }

  generateNextSequences() {
    const potentialNextSequences = [];
    const sequenceLengthMinusOne = this.sequenceIdentifier.length - 1;

    for (let idx = 0; idx < sequenceLengthMinusOne; idx++) {
      const firstChar = this.sequenceIdentifier[idx];
      const secondChar = this.sequenceIdentifier[idx + 1];

      if (firstChar === secondChar) {
        continue;
      }

      const replacementHue = this._determineReplacementHue(firstChar, secondChar);
      const modifiedSequence = `${this.sequenceIdentifier.slice(0, idx)}${replacementHue.repeat(2)}${this.sequenceIdentifier.slice(idx + 2)}`;
      potentialNextSequences.push(modifiedSequence);
    }
    return potentialNextSequences;
  }
}

class SequenceAnalyzer {
  constructor() {
    this.sequenceRegistry = new Map();
    this.processingQueue = [];
  }

  analyzeSequences(initialSequenceId) {
    this.sequenceRegistry.set(initialSequenceId, new SegmentSequence(initialSequenceId, 0));
    this.processingQueue.push(initialSequenceId);

    while(this.processingQueue.length > 0) {
      const currentSequenceId = this.processingQueue.shift();
      const currentSequenceObject = this.sequenceRegistry.get(currentSequenceId);
      const potentialNextSequences = currentSequenceObject.generateNextSequences();

      if (potentialNextSequences.length === 0) {
        return currentSequenceObject;
      }

      for (const nextSequenceId of potentialNextSequences) {
        if (this.sequenceRegistry.has(nextSequenceId)) {
          continue;
        }

        const newElapsedTime = currentSequenceObject.elapsedTime + 1;
        this.sequenceRegistry.set(nextSequenceId, new SegmentSequence(nextSequenceId, newElapsedTime));
        this.processingQueue.push(nextSequenceId);
      }
    }
    return undefined;
  }
}

for (const currentInputLine of processedLines) {
  if (currentInputLine === '0') {
    continue;
  }

  const analyzerInstance = new SequenceAnalyzer();
  const finalSequenceResult = analyzerInstance.analyzeSequences(currentInputLine);

  const outputValue = finalSequenceResult ? finalSequenceResult.elapsedTime : 'NA';
  console.log(outputValue);
}
