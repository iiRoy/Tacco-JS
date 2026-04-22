"use strict";
(function(rawInputString){
  let processedNumbers = [];
  let currentNumeral = "";
  for (let charIndex = 0; charIndex < rawInputString.length; ++charIndex) {
    let charValue = rawInputString[charIndex];
    if (charValue === ' ' || charValue === '\n' || charValue === '\t' || charValue === '\r') {
      if (currentNumeral.length > 0) {
        processedNumbers.push(Number(currentNumeral));
        currentNumeral = "";
      }
    } else {
      currentNumeral += charValue;
    }
  }
  if (currentNumeral.length > 0) {
    processedNumbers.push(Number(currentNumeral));
  }

  let nodesQuantity = processedNumbers.shift();
  let paletteSize = processedNumbers.shift();
  const moduloPrime = 1000000007;

  let graphTopology = new Array(nodesQuantity + 1);
  for (let k = 0; k <= nodesQuantity; ++k) {
    graphTopology[k] = { adjacent: new Set(), depthLevel: 0 };
  }

  graphTopology[0].adjacent.add(1);
  graphTopology[1].adjacent.add(0);

  while (processedNumbers.length > 0) {
    let vertexA = processedNumbers.pop();
    let vertexB = processedNumbers.pop();
    graphTopology[vertexA].adjacent.add(vertexB);
    graphTopology[vertexB].adjacent.add(vertexA);
  }

  const establishDepths = (currentIdx, parentIdx, currentLevel) => {
    graphTopology[currentIdx].depthLevel = currentLevel;
    for (let neighborIdx of graphTopology[currentIdx].adjacent) {
      if (neighborIdx !== parentIdx) {
        establishDepths(neighborIdx, currentIdx, currentLevel + 1);
      }
    }
  };

  establishDepths(0, -1, 0);

  const computeCombinations = (currentIdx, parentIdx) => {
    let currentVertexFactor = 1;
    let actualChildrenCount = 0;

    for (let neighborIdx of graphTopology[currentIdx].adjacent) {
      if (neighborIdx !== parentIdx) {
        actualChildrenCount++;
        currentVertexFactor = (currentVertexFactor * computeCombinations(neighborIdx, currentIdx)) % moduloPrime;
      }
    }

    let baseColorChoices = paletteSize - (graphTopology[currentIdx].depthLevel < 2 ? graphTopology[currentIdx].depthLevel : 2);
    
    for (let j = 0; j < actualChildrenCount; ++j) {
      currentVertexFactor = (currentVertexFactor * (baseColorChoices - j)) % moduloPrime;
    }

    return currentVertexFactor;
  };

  let finalOutcome = computeCombinations(0, -1);

  console.log(finalOutcome);

})(require("fs").readFileSync("/dev/stdin","utf8"));