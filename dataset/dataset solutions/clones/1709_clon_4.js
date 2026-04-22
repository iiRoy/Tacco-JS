const parseNumericValue = (textualInput) => Number(textualInput);

const findBestIndex = (numericArray) =>
  numericArray.reduce((currentBestIndex, currentValue, currentIndex, fullArray) =>
    currentValue > fullArray[currentBestIndex] ? currentIndex : currentBestIndex
  , 0);

const calculateNetBenefit = (dayIndex, activityTypeIndex, activityTimeline, dailyCostFactors, dailySatisfactionMatrix) => {
  let currentBenefit = 0;
  currentBenefit += dailySatisfactionMatrix[dayIndex][activityTypeIndex];

  const penaltyFromOtherActivities = Array.from({ length: 26 }, (_, typeIdx) => typeIdx)
    .filter(typeIdx => typeIdx !== activityTypeIndex)
    .reduce((totalPenalty, typeIdx) => {
      const lastActiveDay = activityTimeline.get(typeIdx) || -1;
      return totalPenalty + dailyCostFactors[typeIdx] * (dayIndex - lastActiveDay);
    }, 0);

  currentBenefit -= penaltyFromOtherActivities;
  return currentBenefit;
};

const generateChoiceCombinations = (availableChoices, depth) => {
  if (depth === 0) {
    return [[]];
  }
  return availableChoices.flatMap(choice =>
    generateChoiceCombinations(availableChoices, depth - 1).map(combo => [choice, ...combo])
  );
};

const resolveContestSchedule = (rawInputText) => {
  const inputLines = rawInputText.split('\n');
  const numericData = inputLines.map(line => line.split(' ').map(parseNumericValue));

  const totalDays = numericData[0][0];
  const costFactors = numericData[1];
  const satisfactionMatrix = numericData.slice(2);

  const chosenActivities = [];
  const lastActivityOccurrences = new Map(Array.from({ length: 26 }, (_, idx) => [idx, -1]));

  const allPossibleTypes = Array.from({ length: 26 }, (_, i) => i);
  const tripleBlockCount = Math.floor(totalDays / 3);

  Array.from({ length: tripleBlockCount }, (_, blockIteration) => {
    const currentBlockDayStart = blockIteration * 3;
    const currentBlockDayMiddle = currentBlockDayStart + 1;
    const currentBlockDayEnd = currentBlockDayStart + 2;

    const allTripleChoices = generateChoiceCombinations(allPossibleTypes, 3);

    const evaluatedTriples = allTripleChoices.map(triple => {
      const [firstChoice, secondChoice, thirdChoice] = triple;
      let currentTimelineSnapshot = new Map(lastActivityOccurrences);
      let cumulativeBenefitForTriple = 0;

      currentTimelineSnapshot.set(firstChoice, currentBlockDayStart);
      cumulativeBenefitForTriple += calculateNetBenefit(currentBlockDayStart, firstChoice, currentTimelineSnapshot, costFactors, satisfactionMatrix);

      currentTimelineSnapshot.set(secondChoice, currentBlockDayMiddle);
      cumulativeBenefitForTriple += calculateNetBenefit(currentBlockDayMiddle, secondChoice, currentTimelineSnapshot, costFactors, satisfactionMatrix);

      currentTimelineSnapshot.set(thirdChoice, currentBlockDayEnd);
      cumulativeBenefitForTriple += calculateNetBenefit(currentBlockDayEnd, thirdChoice, currentTimelineSnapshot, costFactors, satisfactionMatrix);

      return [firstChoice, secondChoice, thirdChoice, cumulativeBenefitForTriple];
    });

    const bestTripleScores = evaluatedTriples.map(entry => entry[3]);
    const bestTripleIndex = findBestIndex(bestTripleScores);
    const [selectedFirst, selectedSecond, selectedThird] = evaluatedTriples[bestTripleIndex].slice(0, 3);

    chosenActivities.push(selectedFirst + 1, selectedSecond + 1, selectedThird + 1);

    lastActivityOccurrences.set(selectedFirst, currentBlockDayStart);
    lastActivityOccurrences.set(selectedSecond, currentBlockDayMiddle);
    lastActivityOccurrences.set(selectedThird, currentBlockDayEnd);
  });

  const remainingDaysStart = tripleBlockCount * 3;
  Array.from({ length: totalDays - remainingDaysStart }, (_, i) => i + remainingDaysStart)
    .forEach(currentDayIndex => {
      const dayEvaluationScores = allPossibleTypes.map(typeIdx =>
        calculateNetBenefit(currentDayIndex, typeIdx, lastActivityOccurrences, costFactors, satisfactionMatrix)
      );

      const bestTypeForCurrentDay = findBestIndex(dayEvaluationScores);
      chosenActivities.push(bestTypeForCurrentDay + 1);
      lastActivityOccurrences.set(bestTypeForCurrentDay, currentDayIndex);
    });

  return chosenActivities.join('\n');
};

console.log(resolveContestSchedule(require("fs").readFileSync("/dev/stdin", "utf8")));