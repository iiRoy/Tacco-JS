function ProcessCoordinates(incomingString) {
  const dataLines = incomingString.trim().split("\n");

  // Skip the first line (which contains N) and parse the coordinate pairs
  const coordinateEntities = dataLines.slice(1).map(currentLine => {
    const numericalComponents = currentLine.split(" ").map(Number);
    return { horizontalMeasure: numericalComponents[0], verticalMeasure: numericalComponents[1] };
  });

  // Calculate the relationship count for each entity
  const computedValues = coordinateEntities.map((primaryEntity, primaryIndex) => {
    // Start count from 1, including the primary entity itself
    const dominanceTally = coordinateEntities.reduce((currentTally, secondaryEntity, secondaryIndex) => {
      // Avoid self-comparison
      if (primaryIndex === secondaryIndex) {
        return currentTally;
      }

      // Check if one entity strictly dominates the other in both dimensions
      const primaryDominatesSecondary = (
        primaryEntity.horizontalMeasure < secondaryEntity.horizontalMeasure &&
        primaryEntity.verticalMeasure < secondaryEntity.verticalMeasure
      );
      const secondaryDominatesPrimary = (
        secondaryEntity.horizontalMeasure < primaryEntity.horizontalMeasure &&
        secondaryEntity.verticalMeasure < primaryEntity.verticalMeasure
      );

      if (primaryDominatesSecondary || secondaryDominatesPrimary) {
        return currentTally + 1;
      }
      return currentTally;
    }, 0); // Initial count for *other* entities

    return dominanceTally + 1; // Add 1 for the primary entity itself
  });

  // Output each computed value
  computedValues.forEach(valueToDisplay => console.log(valueToDisplay));
}

ProcessCoordinates(require("fs").readFileSync("/dev/stdin", "utf8"));