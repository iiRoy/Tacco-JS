const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedLines = rawData.trim().split('\n');

const VALID_HUES = ['r', 'g', 'b'];

const getMissingHue = (hue1, hue2) => {
  const remainingHues = VALID_HUES.filter(h => h !== hue1 && h !== hue2);
  return remainingHues.length > 0 ? remainingHues[0] : null;
};

class ColorSequence {
  constructor(sequenceIdentifier, currentLevel) {
    this.sequenceIdentifier = sequenceIdentifier;
    this.currentLevel = currentLevel;
    this.hueComponents = sequenceIdentifier.split('');
  }

  generateNextSequences() {
    const potentialSuccessors = [];
    const sequenceLength = this.hueComponents.length;
    const lastIndexToCheck = sequenceLength - 1;

    for (let i = 0; i < lastIndexToCheck; ++i) {
      const firstComponent = this.hueComponents[i];
      const secondComponent = this.hueComponents[i + 1];

      if (firstComponent === secondComponent) {
        continue;
      }

      const replacementComponent = getMissingHue(firstComponent, secondComponent);
      if (replacementComponent === null) {
          continue;
      }

      const newHueComponents = [...this.hueComponents];
      newHueComponents[i] = replacementComponent;
      newHueComponents[i + 1] = replacementComponent;

      potentialSuccessors.push(newHueComponents.join(''));
    }
    return potentialSuccessors;
  }
}

class SequenceExplorer {
  constructor() {
    this.visitedNodes = new Map();
    this.processingQueue = [];
  }

  _enqueueSequence(sequenceId, parentNode) {
    const newLevel = parentNode ? parentNode.currentLevel + 1 : 0;
    const newSequenceNode = new ColorSequence(sequenceId, newLevel);
    this.visitedNodes.set(sequenceId, newSequenceNode);
    this.processingQueue.push(sequenceId);
    return newSequenceNode;
  }

  exploreShortestPath(startingSequenceId) {
    this._enqueueSequence(startingSequenceId, null);

    while (this.processingQueue.length > 0) {
      const currentId = this.processingQueue.shift();
      const currentNode = this.visitedNodes.get(currentId);

      const generatedChildren = currentNode.generateNextSequences();

      if (generatedChildren.length === 0) {
        return currentNode;
      }

      for (const childId of generatedChildren) {
        if (!this.visitedNodes.has(childId)) {
          this._enqueueSequence(childId, currentNode);
        }
      }
    }
    return null;
  }
}

for (const line of processedLines) {
  if (line === '0') {
    continue;
  }

  const explorer = new SequenceExplorer();
  const resultNode = explorer.exploreShortestPath(line);

  const outputValue = resultNode ? resultNode.currentLevel : 'NA';
  console.log(outputValue);
}
