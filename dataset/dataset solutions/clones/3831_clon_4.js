const obtainDistinctItems = (dataCollection) => [...new Set(dataCollection)];

const generateAllSubsections = (sourceSequence) => {
  const sequenceLength = sourceSequence.length;
  return Array.from({ length: sequenceLength }, (_, startIdx) =>
    Array.from({ length: sequenceLength - startIdx }, (_, lenOffset) =>
      sourceSequence.substring(startIdx, startIdx + lenOffset + 1)
    )
  ).flat();
};

const retrieveRankedFragment = (sourceFragments, desiredRankValue) => {
  const orderedFragments = [...sourceFragments].sort();
  return orderedFragments[desiredRankValue - 1];
};

const initiateProcessing = (inputPayload) => {
  const inputRows = inputPayload.split('\n');
  const primaryCharacterSequence = inputRows[0];
  const targetSelectionRank = parseInt(inputRows[1], 10);

  const allConstructedSubsequences = generateAllSubsections(primaryCharacterSequence);
  const uniqueSubsequenceCollection = obtainDistinctItems(allConstructedSubsequences);
  const finalOutcome = retrieveRankedFragment(uniqueSubsequenceCollection, targetSelectionRank);

  console.log(finalOutcome);
};

initiateProcessing(require('fs').readFileSync('/dev/stdin', 'utf8'));