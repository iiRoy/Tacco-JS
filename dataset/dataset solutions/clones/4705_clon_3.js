const getOppositeAnimalType = (currentType) => {
  return currentType === "W" ? "S" : "W";
};

const calculateCurrentAnimalType = (previousAnimalType, previousStatementChar, twoStepsBackAnimalType) => {
  const isPreviousAnimalWolf = (previousAnimalType === "W");
  const isPreviousStatementO = (previousStatementChar === "o");

  const shouldCurrentAnimalBeSheep = (isPreviousAnimalWolf ^ isPreviousStatementO);

  if (shouldCurrentAnimalBeSheep) {
    return twoStepsBackAnimalType;
  } else {
    return getOppositeAnimalType(twoStepsBackAnimalType);
  }
};

const checkCircularConsistency = (sequenceArray, statementString, sequenceLength) => {
  const animalZeroIsSheep = (sequenceArray[0] === "S");
  const statementZeroIsO = (statementString[0] === "o");
  const lastAnimalMatchesAnimalOne = (sequenceArray[sequenceLength - 1] === sequenceArray[1]);

  const firstConditionMet = animalZeroIsSheep ^ statementZeroIsO ^ lastAnimalMatchesAnimalOne;

  const lastAnimalIsSheep = (sequenceArray[sequenceLength - 1] === "S");
  const statementNMinus1IsO = (statementString[sequenceLength - 1] === "o");
  const secondLastAnimalMatchesAnimalZero = (sequenceArray[sequenceLength - 2] === sequenceArray[0]);

  const secondConditionMet = lastAnimalIsSheep ^ statementNMinus1IsO ^ secondLastAnimalMatchesAnimalZero;

  return firstConditionMet && secondConditionMet;
};

function solveProblem(rawData) {
  const lines = rawData.split("\n");
  const sheepString = lines[1];
  const totalAnimals = sheepString.length;

  let animalSequence;
  let foundSolution = false;

  ["S", "W"].forEach(firstAnimalType => {
    ["S", "W"].forEach(secondAnimalType => {
      animalSequence = new Array(totalAnimals);
      animalSequence[0] = firstAnimalType;
      animalSequence[1] = secondAnimalType;

      for (let currentIndex = 2; currentIndex < totalAnimals; currentIndex++) {
        animalSequence[currentIndex] = calculateCurrentAnimalType(
          animalSequence[currentIndex - 1],
          sheepString[currentIndex - 1],
          animalSequence[currentIndex - 2]
        );
      }

      if (!foundSolution && checkCircularConsistency(animalSequence, sheepString, totalAnimals)) {
        console.log(animalSequence.join(""));
        foundSolution = true;
      }
    });
  });

  if (!foundSolution) {
    console.log(-1);
  }
}

solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
