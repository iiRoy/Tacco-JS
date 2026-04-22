(function(inputString) {
  const inputChunks = inputString.trim().split('\n');

  const initialParameters = inputChunks.shift().split(' ').map(Number);
  const totalNodes = initialParameters.shift();
  const totalEdges = initialParameters.shift();

  const representativeMap = Array(totalNodes).fill(0).map((_, idx) => idx);
  const groupSizes = Array(totalNodes).fill(1);

  const findGroupRepresentative = (memberIndex) => {
    if (representativeMap[memberIndex] === memberIndex) {
      return memberIndex;
    }
    representativeMap[memberIndex] = findGroupRepresentative(representativeMap[memberIndex]);
    return representativeMap[memberIndex];
  };

  const uniteGroups = (elementA, elementB) => {
    let repA = findGroupRepresentative(elementA);
    let repB = findGroupRepresentative(elementB);

    if (repA !== repB) {
      if (groupSizes[repA] < groupSizes[repB]) {
        [repA, repB] = [repB, repA];
      }
      representativeMap[repB] = repA;
      groupSizes[repA] += groupSizes[repB];
      return true;
    }
    return false;
  };

  for (let edgeCounter = 0; edgeCounter < totalEdges; edgeCounter++) {
    const connectionPair = inputChunks.shift().split(' ').map(Number);
    uniteGroups(connectionPair[0], connectionPair[1]);
  }

  const queryCount = parseInt(inputChunks.shift(), 10);

  for (let queryCounter = 0; queryCounter < queryCount; queryCounter++) {
    const comparisonPair = inputChunks[queryCounter].split(' ').map(Number);
    if (findGroupRepresentative(comparisonPair[0]) === findGroupRepresentative(comparisonPair[1])) {
      console.log('yes');
    } else {
      console.log('no');
    }
  }

})(require('fs').readFileSync('/dev/stdin', 'utf8'));