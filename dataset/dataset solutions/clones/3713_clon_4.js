const ProcessInput = (inputData) => {
  const [sizeString, valuesString] = inputData.split('\n');
  const totalElementsCount = parseInt(sizeString);
  const finalIndex = totalElementsCount - 1;
  const rawNumbers = valuesString.split(' ').map(Number);

  const aggregatedValues = rawNumbers.reduce((accumulator, currentVal) => {
    const previousSum = accumulator.length === 0 ? 0 : accumulator[accumulator.length - 1];
    return [...accumulator, previousSum + currentVal];
  }, []);

  let overallMinimumDifference = Number.MAX_SAFE_INTEGER;

  for (let midPointIdx = 1; midPointIdx <= finalIndex - 2; ++midPointIdx) {
    const targetLeftSectionSum = aggregatedValues[midPointIdx] / 2;
    const targetRightSectionSum = (aggregatedValues[finalIndex] + aggregatedValues[midPointIdx]) / 2;

    const firstSplitCandidateIdx = RetrieveLowerBound(aggregatedValues, 0, midPointIdx - 1, targetLeftSectionSum);
    const thirdSplitCandidateIdx = RetrieveLowerBound(aggregatedValues, midPointIdx + 1, finalIndex - 1, targetRightSectionSum);

    const firstSplitPositions = [firstSplitCandidateIdx];
    if (firstSplitCandidateIdx > 0) {
      firstSplitPositions.push(firstSplitCandidateIdx - 1);
    }

    const thirdSplitPositions = [thirdSplitCandidateIdx];
    if (thirdSplitCandidateIdx > midPointIdx + 1) {
      thirdSplitPositions.push(thirdSplitCandidateIdx - 1);
    }

    for (const currentFirstSplit of firstSplitPositions) {
      for (const currentThirdSplit of thirdSplitPositions) {
        if (currentFirstSplit >= midPointIdx || currentThirdSplit <= midPointIdx || currentThirdSplit >= finalIndex) {
            continue;
        }

        const sectionOneSum = aggregatedValues[currentFirstSplit];
        const sectionTwoSum = aggregatedValues[midPointIdx] - aggregatedValues[currentFirstSplit];
        const sectionThreeSum = aggregatedValues[currentThirdSplit] - aggregatedValues[midPointIdx];
        const sectionFourSum = aggregatedValues[finalIndex] - aggregatedValues[currentThirdSplit];

        const currentSectionSums = [sectionOneSum, sectionTwoSum, sectionThreeSum, sectionFourSum];
        currentSectionSums.sort((valA, valB) => valA - valB);

        overallMinimumDifference = Math.min(overallMinimumDifference, currentSectionSums[3] - currentSectionSums[0]);
      }
    }
  }

  console.log(overallMinimumDifference);
};

const RetrieveLowerBound = (collection, begin, end, targetValue) => {
  if (end - begin <= 1) {
    return collection[begin] < targetValue ? end : begin;
  }
  const centralIndex = Math.floor((begin + end) / 2);
  if (collection[centralIndex] < targetValue) {
    return RetrieveLowerBound(collection, centralIndex, end, targetValue);
  } else {
    return RetrieveLowerBound(collection, begin, centralIndex, targetValue);
  }
};

ProcessInput(require("fs").readFileSync("/dev/stdin","utf8"));