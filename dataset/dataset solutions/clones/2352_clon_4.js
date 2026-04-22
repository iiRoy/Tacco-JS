let allIndividualsInfo;
let totalIndividuals;

function countActiveBits(value) {
  if (value === 0) return 0;
  return (value & 1) + countActiveBits(value >> 1);
}

function fetchBitState(mask, index) {
  return (mask >> index) & 1;
}

function checkValidity(assignmentMask) {
  return allIndividualsInfo.every((individual) => {
    const isSpeakerHonest = fetchBitState(assignmentMask, individual.id);

    return individual.stmts.every((declaration) => {
      const declaredTargetIsHonest = fetchBitState(assignmentMask, declaration.target - 1);

      return isSpeakerHonest === (declaredTargetIsHonest === declaration.state);
    });
  });
}

function recursiveSearch(currentPersonIdx, currentAssignmentMask, highestCountFound) {
  if (currentPersonIdx === totalIndividuals) {
    if (checkValidity(currentAssignmentMask)) {
      return Math.max(highestCountFound, countActiveBits(currentAssignmentMask));
    }
    return highestCountFound;
  }

  let resultIfHonest = recursiveSearch(
    currentPersonIdx + 1,
    currentAssignmentMask | (1 << currentPersonIdx),
    highestCountFound
  );

  let resultIfLiar = recursiveSearch(
    currentPersonIdx + 1,
    currentAssignmentMask,
    highestCountFound
  );

  return Math.max(resultIfHonest, resultIfLiar);
}

function processInputData(rawTxt) {
  const segments = rawTxt.split("\n");
  totalIndividuals = +segments[0];
  let cursor = 1;
  const collectedInfo = [];

  for (let personId = 0; personId < totalIndividuals; personId++) {
    const numDeclarations = +segments[cursor++];
    const personDeclarations = [];
    for (let k = 0; k < numDeclarations; k++) {
      const parts = segments[cursor++].split(' ').map(Number);
      personDeclarations.push({ target: parts[0], state: parts[1] });
    }
    collectedInfo.push({ id: personId, stmts: personDeclarations });
  }
  return collectedInfo;
}

function entryPoint(rawTxt) {
  allIndividualsInfo = processInputData(rawTxt);
  const finalResult = recursiveSearch(0, 0, 0);
  console.log(finalResult);
}

entryPoint(require("fs").readFileSync("/dev/stdin", "utf8").trim());