function calculateMovementEffects(inputSequence) {
  const segmentExtractor = (sourceText) => {
    const sectionContainers = [];
    let scanPosition = 0;
    while (true) {
      const divisionPoint = sourceText.indexOf('LR', scanPosition);
      if (divisionPoint === -1) {
        sectionContainers.push(sourceText.substring(scanPosition));
        break;
      }
      sectionContainers.push(sourceText.substring(scanPosition, divisionPoint));
      scanPosition = divisionPoint + 2;
    }
    return sectionContainers;
  };

  const rawSections = segmentExtractor(inputSequence);

  const adjustedSections = rawSections.map(sectionPart => "R" + sectionPart + "L");

  if (adjustedSections.length > 0) {
    adjustedSections[0] = adjustedSections[0].substring(1);
    const lastSectionIndex = adjustedSections.length - 1;
    adjustedSections[lastSectionIndex] = adjustedSections[lastSectionIndex].substring(0, adjustedSections[lastSectionIndex].length - 1);
  }

  const finalStationCounts = new Array(inputSequence.length).fill(0);
  let globalIndexOffset = 0;

  adjustedSections.forEach(currentSection => {
    const sectionLength = currentSection.length;
    for (let internalIndex = 0; internalIndex < sectionLength; ++internalIndex) {
      if (internalIndex > 0 && currentSection[internalIndex - 1] === 'R' && currentSection[internalIndex] === 'L') {
        const countFromLeft = internalIndex;
        const countFromRight = sectionLength - internalIndex;

        let conditionAlpha = (countFromLeft > countFromRight) ? 0 : 1;
        let conditionBeta = (Math.min(countFromLeft, countFromRight) % 2 === 0) ? 0 : 1;
        let conditionGamma = conditionAlpha ^ conditionBeta;

        if (sectionLength % 2 === 0) {
          finalStationCounts[globalIndexOffset + internalIndex - 1] = sectionLength / 2;
          finalStationCounts[globalIndexOffset + internalIndex] = sectionLength / 2;
        } else if (conditionGamma === 0) {
          finalStationCounts[globalIndexOffset + internalIndex - 1] = (sectionLength + 1) / 2;
          finalStationCounts[globalIndexOffset + internalIndex] = (sectionLength - 1) / 2;
        } else {
          finalStationCounts[globalIndexOffset + internalIndex - 1] = (sectionLength - 1) / 2;
          finalStationCounts[globalIndexOffset + internalIndex] = (sectionLength + 1) / 2;
        }
      }
    }
    globalIndexOffset += sectionLength;
  });

  return finalStationCounts.join(" ") + "\n";
}

console.log(calculateMovementEffects(require("fs").readFileSync("/dev/stdin", "utf8")));