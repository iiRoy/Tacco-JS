const interpretCoordinates = (entryText) => {
  const numericalParts = entryText.split(' ').map(Number);
  return { coordX: numericalParts[0], coordY: numericalParts[1] };
};

const assessDominance = (firstPoint, secondPoint) => {
  return (firstPoint.coordX < secondPoint.coordX && firstPoint.coordY < secondPoint.coordY) ||
         (secondPoint.coordX < firstPoint.coordX && secondPoint.coordY < secondPoint.coordY);
};

function processDataset(fullContent) {
  const contentLines = fullContent.split('\n');
  const countOfEntries = parseInt(contentLines[0], 10);
  const pointSet = contentLines.slice(1, countOfEntries + 1).map(interpretCoordinates);

  pointSet.forEach((mainPoint, mainIndex) => {
    console.log("##########");

    const determineRelatedCount = (currentExaminationIndex, runningTally) => {
      if (currentExaminationIndex >= pointSet.length) {
        return runningTally;
      }

      const comparisonPoint = pointSet[currentExaminationIndex];

      if (mainIndex === currentExaminationIndex) {
        return determineRelatedCount(currentExaminationIndex + 1, runningTally);
      }

      if (assessDominance(mainPoint, comparisonPoint)) {
        console.log(comparisonPoint.coordX, comparisonPoint.coordY);
        return determineRelatedCount(currentExaminationIndex + 1, runningTally + 1);
      } else {
        return determineRelatedCount(currentExaminationIndex + 1, runningTally);
      }
    };

    const finalResult = determineRelatedCount(0, 1);
    console.log(finalResult);
  });
}

processDataset(require("fs").readFileSync("/dev/stdin", "utf8"));