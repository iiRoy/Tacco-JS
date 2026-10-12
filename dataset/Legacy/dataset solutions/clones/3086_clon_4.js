let boardDimension = 0;

function processInput(inputString) {
  const lines = inputString.split('\n');
  const [dimensionString] = lines[0].split(' ');
  boardDimension = parseInt(dimensionString);

  const characterToInitialPositions = new Map();
  let currentTileQuantities = new Map();

  Array.from(lines[1]).forEach((tileChar, initialIndex) => {
    if (!characterToInitialPositions.has(tileChar)) {
      characterToInitialPositions.set(tileChar, new Set());
    }
    characterToInitialPositions.get(tileChar).add(initialIndex);
    currentTileQuantities.set(initialIndex, (currentTileQuantities.get(initialIndex) || 0) + 1);
  });

  const finalTileQuantities = lines.slice(2).reduce((accumulatedQuantities, queryEntry) => {
    const [targetCharacter, movementDirection] = queryEntry.split(' ');

    const relevantInitialIndices = characterToInitialPositions.get(targetCharacter);
    if (!relevantInitialIndices) {
      return accumulatedQuantities;
    }

    const nextQuantitiesState = new Map(accumulatedQuantities);

    const indicesForProcessing = Array.from(relevantInitialIndices);
    if (movementDirection === "R") {
      indicesForProcessing.sort((a, b) => b - a);
    } else {
      indicesForProcessing.sort((a, b) => a - b);
    }

    indicesForProcessing.forEach(sourceIndex => {
      const quantityAtSource = accumulatedQuantities.get(sourceIndex) || 0;

      if (quantityAtSource > 0) {
        const displacementValue = (movementDirection === "R") ? 1 : -1;
        const destinationPosition = sourceIndex + displacementValue;

        nextQuantitiesState.set(sourceIndex, (nextQuantitiesState.get(sourceIndex) || 0) - quantityAtSource);
        if (nextQuantitiesState.get(sourceIndex) === 0) {
          nextQuantitiesState.delete(sourceIndex);
        }

        if (destinationPosition >= 0 && destinationPosition < boardDimension) {
          nextQuantitiesState.set(destinationPosition, (nextQuantitiesState.get(destinationPosition) || 0) + quantityAtSource);
        }
      }
    });

    return nextQuantitiesState;
  }, currentTileQuantities);

  const totalCount = Array.from(finalTileQuantities.values()).reduce((summation, quantity) => summation + quantity, 0);

  console.log(totalCount);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
