'use strict';
((inputSource) => {
  const extractDimensionPairs = (rawTextContent) => {
    const contentLines = rawTextContent.toString().trim().split('\n');
    const parsedDimensionSets = [];
    for (const currentInputLine of contentLines) {
      if (currentInputLine === '0 0') {
        break;
      }
      const numericValues = currentInputLine.split(' ').map(Number);
      parsedDimensionSets.push(numericValues);
    }
    return parsedDimensionSets;
  };

  const constructCheckerboard = (dimensionsArray) => {
    const [boardHeight, boardWidth] = dimensionsArray;
    return Array.from({ length: boardHeight }, (_, rowIdentifier) =>
      Array.from({ length: boardWidth }, (_, columnIdentifier) =>
        ((rowIdentifier + columnIdentifier) % 2 === 0) ? '#' : '.'
      ).join('')
    ).join('\n');
  };

  const dimensionConfigurations = extractDimensionPairs(inputSource);

  const generatedVisualizations = dimensionConfigurations.map(constructCheckerboard);

  const combinedOutput = generatedVisualizations.join('\n\n');

  console.log(combinedOutput);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
