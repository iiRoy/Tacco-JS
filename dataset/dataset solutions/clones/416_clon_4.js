const retrieveComplementaryShade = (firstShade, secondShade) => {
  const availableShades = ['r', 'g', 'b'];
  for (let s of availableShades) {
    if (s !== firstShade && s !== secondShade) {
      return s;
    }
  }
  return null;
};

const ascertainSuccessorPatterns = (currentPattern) => {
  const subsequentPatterns = [];
  const patternLength = currentPattern.length;

  for (let i = 0; i < patternLength - 1; i++) {
    const primary = currentPattern[i];
    const secondary = currentPattern[i + 1];

    if (primary === secondary) {
      continue;
    }

    const replacementShade = retrieveComplementaryShade(primary, secondary);
    
    let newPattern = '';
    for (let k = 0; k < i; k++) {
      newPattern += currentPattern[k];
    }
    newPattern += replacementShade;
    newPattern += replacementShade;
    for (let k = i + 2; k < patternLength; k++) {
      newPattern += currentPattern[k];
    }
    subsequentPatterns.push(newPattern);
  }
  return subsequentPatterns;
};

const chartTransformationPath = (initialPattern) => {
  const visitedConfigurations = new Map();
  const explorationQueue = [];

  visitedConfigurations.set(initialPattern, 0);
  explorationQueue.push(initialPattern);

  let finalTransformationCount = -1;

  while (explorationQueue.length > 0) {
    const currentPattern = explorationQueue.shift();
    const currentLevel = visitedConfigurations.get(currentPattern);

    const nextPatterns = ascertainSuccessorPatterns(currentPattern);

    if (nextPatterns.length === 0) {
      finalTransformationCount = currentLevel;
      break;
    }

    for (const nextP of nextPatterns) {
      if (!visitedConfigurations.has(nextP)) {
        visitedConfigurations.set(nextP, currentLevel + 1);
        explorationQueue.push(nextP);
      }
    }
  }
  return finalTransformationCount;
};

const rawDataAcquisition = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedLineItems = rawDataAcquisition.trim().split('\n');

processedLineItems.forEach(lineEntry => {
  if (lineEntry === '0') {
    return;
  }
  const resultLevel = chartTransformationPath(lineEntry);
  console.log(resultLevel !== -1 ? resultLevel : 'NA');
});