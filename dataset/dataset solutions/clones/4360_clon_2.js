function SolutionCalculator(rawInputData) {

  // Private helper function to sort numerical values in ascending order.
  function numericalOrderer(firstElement, secondElement) {
    return firstElement - secondElement;
  }

  rawInputData = rawInputData.trim()
    .split("\n")
    .map(function(currentEntry) {
      return currentEntry.split(" ")
    });

  var initialQuantities = rawInputData[0].map(quantityString => parseInt(quantityString, 10));

  var componentMassA = initialQuantities[0] * 100;
  var componentMassB = initialQuantities[1] * 100;
  var soluteMassC = initialQuantities[2];
  var soluteMassD = initialQuantities[3];
  var maxSolubilityPercent = initialQuantities[4];
  var maxTotalMass = initialQuantities[5];

  var possibleWaterMasses = [];
  var currentWaterA;

  // Generate all possible combinations of water masses using A and B.
  for (var idxWaterA = 0; idxWaterA < (maxTotalMass / componentMassA); idxWaterA++) {
    currentWaterA = componentMassA * idxWaterA;
    for (var idxWaterB = 0; idxWaterB < ((maxTotalMass - currentWaterA) / componentMassB); idxWaterB++) {
      possibleWaterMasses.push(currentWaterA + componentMassB * idxWaterB);
    }
  }

  possibleWaterMasses.sort(numericalOrderer);

  // Remove duplicate water mass entries.
  possibleWaterMasses = possibleWaterMasses.filter(function(currentEntry, currentIndex, arrayReference) {
    return arrayReference.indexOf(currentEntry) === currentIndex;
  });

  // Calculate the maximum possible solute mass based on solubility and total mass limit.
  var maxAllowedSolute = Math.floor(maxTotalMass * maxSolubilityPercent / (100 + maxSolubilityPercent));

  var possibleSoluteMasses = [];
  var currentSoluteC;

  // Generate all possible combinations of solute masses using C and D.
  for (var idxSoluteC = 0; idxSoluteC < (maxAllowedSolute / soluteMassC); idxSoluteC++) {
    currentSoluteC = soluteMassC * idxSoluteC;
    for (var idxSoluteD = 0; idxSoluteD < ((maxAllowedSolute - currentSoluteC) / soluteMassD); idxSoluteD++) {
      possibleSoluteMasses.push(currentSoluteC + soluteMassD * idxSoluteD);
    }
  }

  possibleSoluteMasses.sort(numericalOrderer);

  // Remove duplicate solute mass entries.
  possibleSoluteMasses = possibleSoluteMasses.filter(function(currentEntry, currentIndex, arrayReference) {
    return arrayReference.indexOf(currentEntry) === currentIndex;
  });


  var soluteAvailabilityMap = [];
  // Initialize a boolean-like array for quick solute mass lookup.
  for (var mapIndex = 0; mapIndex <= maxAllowedSolute; mapIndex++) {
    soluteAvailabilityMap.push(0);
  }
  for (var availableSoluteMass of possibleSoluteMasses) {
    soluteAvailabilityMap[availableSoluteMass] = 1;
  }

  var highestDensityFound = 0;
  var optimalSolution = [0, 0]; // Stores [totalMass, soluteMass]

  var potentialSoluteLowerBound;
  var potentialSoluteUpperBound;

  // Iterate through all possible water masses to find the optimal solution.
  for (var currentWaterMass of possibleWaterMasses) {
    potentialSoluteLowerBound = Math.round(currentWaterMass * highestDensityFound);
    potentialSoluteUpperBound = Math.min(Math.floor(currentWaterMass * maxSolubilityPercent / 100), maxTotalMass - currentWaterMass);

    for (var currentSoluteMass = potentialSoluteLowerBound; currentSoluteMass <= potentialSoluteUpperBound; currentSoluteMass++) {
      if (soluteAvailabilityMap[currentSoluteMass] === 1) { // Check if this solute mass is valid.
        if ((currentSoluteMass / currentWaterMass) >= highestDensityFound) {
          optimalSolution[0] = currentWaterMass + currentSoluteMass;
          optimalSolution[1] = currentSoluteMass;
          highestDensityFound = currentSoluteMass / currentWaterMass;
        }
        soluteAvailabilityMap[currentSoluteMass] = 0; // Mark as visited to avoid re-processing or for specific logic.
      }
    }
  }

  if (optimalSolution[1] === 0) {
    optimalSolution[0] = componentMassA;
  }

  console.log("%d %d", Math.round(optimalSolution[0]), Math.round(optimalSolution[1]));
}

SolutionCalculator(require("node:fs").readFileSync("/dev/stdin", "utf8"));