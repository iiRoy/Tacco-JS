class SourceReader {
  constructor(rawContent) {
    this.segments = rawContent.trim().split('\n');
    this.currentSegmentIndex = 0;
    this.currentSegmentTokens = [];
  }

  fetchItem(asString = false) {
    if (this.currentSegmentTokens.length === 0) {
      if (this.currentSegmentIndex >= this.segments.length) {
        // Handle end of input gracefully, though original might throw error
        return undefined;
      }
      const line = this.segments[this.currentSegmentIndex++];
      this.currentSegmentTokens = line.split(' ').reverse();
    }
    const extracted = this.currentSegmentTokens.pop();
    return asString ? extracted : Number(extracted);
  }

  fetchLine(asString = false) {
    if (this.currentSegmentIndex >= this.segments.length) {
      return asString ? [] : [];
    }
    const line = this.segments[this.currentSegmentIndex++];
    const tokens = line.split(' ');
    return asString ? tokens : tokens.map(Number);
  }

  fetchMatrix(count, asString = false) {
    const collectedRows = [];
    for (let i = 0; i < count; i++) {
      if (this.currentSegmentIndex >= this.segments.length) {
        break; // Not enough lines
      }
      const line = this.segments[this.currentSegmentIndex++];
      const tokens = line.split(' ');
      collectedRows.push(asString ? tokens : tokens.map(Number));
    }
    return collectedRows;
  }

  fetchRows(count, asString = false) {
    const collectedData = [];
    for (let i = 0; i < count; i++) {
      if (this.currentSegmentIndex >= this.segments.length) {
        break; // Not enough lines
      }
      const line = this.segments[this.currentSegmentIndex++];
      collectedData.push(asString ? line : Number(line));
    }
    return collectedData;
  }
}

const sourceData = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const dataHandler = new SourceReader(sourceData);

console.log(processSequence());

function processSequence() {
  const quantity = dataHandler.fetchItem();
  const sequence = dataHandler.fetchLine();

  const frequencyMap = { '0': 1 };

  sequence.reduce((currentSum, element) => {
    const nextSum = currentSum + element;
    frequencyMap[nextSum] = (frequencyMap[nextSum] || 0) + 1;
    return nextSum;
  }, 0);

  let totalPairs = 0;
  Object.values(frequencyMap).forEach(count => {
    totalPairs += (count * (count - 1)) / 2;
  });

  return totalPairs;
}