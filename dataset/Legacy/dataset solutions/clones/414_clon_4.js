const allInputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

const colorUniverse = new Set(['r', 'g', 'b']);

function determineMissingColor(firstChar, secondChar) {
  const temporarySet = new Set(colorUniverse);
  temporarySet.delete(firstChar);
  temporarySet.delete(secondChar);
  return temporarySet.values().next().value;
}

function isHomogeneous(identifierString) {
  return new Set(identifierString).size === 1;
}

function produceSuccessorIdentifiers(currentIdentifier) {
  const successorIdentifiers = [];
  const charSequence = currentIdentifier.split('');
  for (let i = 0; i < charSequence.length - 1; i++) {
    const charA = charSequence[i];
    const charB = charSequence[i + 1];

    if (charA === charB) {
      continue;
    }

    const replacementColor = determineMissingColor(charA, charB);
    const newCharSequence = [...charSequence];
    newCharSequence[i] = replacementColor;
    newCharSequence[i + 1] = replacementColor;
    successorIdentifiers.push(newCharSequence.join(''));
  }
  return successorIdentifiers;
}

function calculateMinimumTransformations(initialIdentifier) {
  const visitedStates = new Map();
  const processingQueue = [];

  if (isHomogeneous(initialIdentifier)) {
    return 0;
  }

  visitedStates.set(initialIdentifier, 0);
  processingQueue.push({ identifier: initialIdentifier, steps: 0 });

  let queueIndex = 0;

  while (queueIndex < processingQueue.length) {
    const { identifier: currentIdentifier, steps: currentSteps } = processingQueue[queueIndex++];

    const potentialNextIdentifiers = produceSuccessorIdentifiers(currentIdentifier);

    if (potentialNextIdentifiers.length === 0) {
        return currentSteps;
    }

    for (const nextIdentifier of potentialNextIdentifiers) {
      if (!visitedStates.has(nextIdentifier)) {
        visitedStates.set(nextIdentifier, currentSteps + 1);
        processingQueue.push({ identifier: nextIdentifier, steps: currentSteps + 1 });
      }
    }
  }
  return null;
}

allInputLines.forEach(currentInputIdentifier => {
  if (currentInputIdentifier === '0') {
    return;
  }
  const transformationResult = calculateMinimumTransformations(currentInputIdentifier);
  console.log(transformationResult !== null ? transformationResult : 'NA');
});
