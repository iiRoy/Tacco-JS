const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedLines = rawInputData.trim().split('\n');

const determineMissingColor = (firstHue, secondHue) => {
  if ((firstHue === 'r' && secondHue === 'g') || (firstHue === 'g' && secondHue === 'r')) {
    return 'b';
  }
  if ((firstHue === 'r' && secondHue === 'b') || (firstHue === 'b' && secondHue === 'r')) {
    return 'g';
  }
  return 'r';
};

const generateMutations = (currentConfig) => {
  return Array.from({ length: currentConfig.length - 1 }, (_, position) => {
    const charA = currentConfig[position];
    const charB = currentConfig[position + 1];

    if (charA === charB) {
      return null;
    }

    const missingColor = determineMissingColor(charA, charB);
    const modifiedConfig = currentConfig.slice(0, position) +
                           missingColor.repeat(2) +
                           currentConfig.slice(position + 2);
    return modifiedConfig;
  }).filter(Boolean);
};

const seekEquilibrium = (initialPattern) => {
  const distanceRegistry = new Map();
  const processingQueue = [];

  distanceRegistry.set(initialPattern, 0);
  processingQueue.push([initialPattern, 0]);

  while (processingQueue.length > 0) {
    const [currentPattern, currentPathLength] = processingQueue.shift();

    const evolvedPatterns = generateMutations(currentPattern);

    if (evolvedPatterns.length === 0) {
      return currentPathLength;
    }

    for (const nextForm of evolvedPatterns) {
      if (!distanceRegistry.has(nextForm)) {
        distanceRegistry.set(nextForm, currentPathLength + 1);
        processingQueue.push([nextForm, currentPathLength + 1]);
      }
    }
  }

  return -1;
};

processedLines.forEach(currentLine => {
  if (currentLine === '0') {
    return;
  }
  const resultPathLength = seekEquilibrium(currentLine);
  console.log(resultPathLength === -1 ? 'NA' : resultPathLength);
});