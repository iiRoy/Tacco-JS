function* provideInputLines(sourceText) {
  const lines = sourceText.trim().split("\n");
  for (const line of lines) {
    yield line;
  }
}

const lineInterpreters = {
  toNumber: (s) => parseInt(s, 10),
  splitBySpace: (s) => s.split(" "),
  splitBySpaceAndToNumbers: (s) => s.split(" ").map(Number),
  splitByChar: (s) => s.split(""),
  splitByCharAndToNumbers: (s) => s.split("").map(Number),
};

function processInputEntry(entry, interpretationKey) {
  if (interpretationKey === undefined || interpretationKey === null) {
    return entry;
  }
  const interpreter = lineInterpreters[interpretationKey];
  if (interpreter) {
    return interpreter(entry);
  }
  return entry;
}

function displayResults(dataItems) {
  console.log(dataItems.join(" "));
}

(function executeSocialAnalysis() {
  const rawEntryData = require("fs").readFileSync("/dev/stdin", "utf8");
  const inputSequence = provideInputLines(rawEntryData);

  const [peopleCount, bondCount, exclusionCount] = processInputEntry(inputSequence.next().value, 'splitBySpaceAndToNumbers');

  const socialGraph = Array.from({ length: peopleCount }, () => new Set());
  const communityIdentifiers = new Array(peopleCount).fill(null);
  const communityMembers = new Map();
  let nextCommunityId = 0;

  for (let b = 0; b < bondCount; b++) {
    const [personA, personB] = processInputEntry(inputSequence.next().value, 'splitBySpaceAndToNumbers');
    socialGraph[personA - 1].add(personB - 1);
    socialGraph[personB - 1].add(personA - 1);
  }

  function exploreCommunity(currentPersonIndex, assignedCommunityId) {
    if (communityIdentifiers[currentPersonIndex] !== null) {
      return;
    }

    communityIdentifiers[currentPersonIndex] = assignedCommunityId;
    if (!communityMembers.has(assignedCommunityId)) {
      communityMembers.set(assignedCommunityId, new Set());
    }
    communityMembers.get(assignedCommunityId).add(currentPersonIndex);

    for (const neighborIndex of socialGraph[currentPersonIndex]) {
      exploreCommunity(neighborIndex, assignedCommunityId);
    }
  }

  for (let p = 0; p < peopleCount; p++) {
    if (communityIdentifiers[p] === null) {
      exploreCommunity(p, nextCommunityId);
      nextCommunityId++;
    }
  }

  const projectedSocialPotential = new Array(peopleCount);
  for (let p = 0; p < peopleCount; p++) {
    const currentCommunityId = communityIdentifiers[p];
    const communitySize = communityMembers.get(currentCommunityId).size;
    const existingBonds = socialGraph[p].size;
    projectedSocialPotential[p] = communitySize - 1 - existingBonds;
  }

  for (let e = 0; e < exclusionCount; e++) {
    const [personX, personY] = processInputEntry(inputSequence.next().value, 'splitBySpaceAndToNumbers');
    const indexX = personX - 1;
    const indexY = personY - 1;

    if (communityIdentifiers[indexX] === communityIdentifiers[indexY]) {
      projectedSocialPotential[indexX]--;
      projectedSocialPotential[indexY]--;
    }
  }

  displayResults(projectedSocialPotential);
})();