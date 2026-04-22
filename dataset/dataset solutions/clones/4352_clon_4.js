const inputBuffer = [];
const ioHandler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

ioHandler.on('line', (dataLine) => {
  inputBuffer.push(dataLine);
});

ioHandler.on('close', () => {
  executeCalculation(inputBuffer);
});

const parseNumbersFromLine = (textLine) => textLine.split(" ").map(Number);

const executeCalculation = (collectedLines) => {
  const params = parseNumbersFromLine(collectedLines[0]);
  
  const waterUnitA = params[0] * 100;
  const waterUnitB = params[1] * 100;
  const sugarUnitC = params[2];
  const sugarUnitD = params[3];
  const maxSolubilityPercentage = params[4];
  const overallCapacityLimit = params[5];

  let bestConcentration = -1.0;
  let resultTuple = [0, 0];

  const reachableWaterMasses = new Array(overallCapacityLimit + 1).fill(false);
  const reachableSugarMasses = new Array(overallCapacityLimit + 1).fill(false);

  const maxUnitsForWaterA = Math.floor(overallCapacityLimit / waterUnitA);
  const maxUnitsForWaterB = Math.floor(overallCapacityLimit / waterUnitB);

  for (let countA = 0; countA <= maxUnitsForWaterA; ++countA) {
    for (let countB = 0; countB <= maxUnitsForWaterB; ++countB) {
      const currentWaterSum = countA * waterUnitA + countB * waterUnitB;
      if (currentWaterSum <= overallCapacityLimit) {
        reachableWaterMasses[currentWaterSum] = true;
      }
    }
  }

  const maxUnitsForSugarC = Math.floor(overallCapacityLimit / sugarUnitC);
  const maxUnitsForSugarD = Math.floor(overallCapacityLimit / sugarUnitD);

  for (let countC = 0; countC <= maxUnitsForSugarC; ++countC) {
    for (let countD = 0; countD <= maxUnitsForSugarD; ++countD) {
      const currentSugarSum = countC * sugarUnitC + countD * sugarUnitD;
      if (currentSugarSum <= overallCapacityLimit) {
        reachableSugarMasses[currentSugarSum] = true;
      }
    }
  }

  for (let currentWaterAmount = 0; currentWaterAmount <= overallCapacityLimit; ++currentWaterAmount) {
    if (!reachableWaterMasses[currentWaterAmount]) continue;

    for (let currentSugarAmount = 0; currentSugarAmount <= overallCapacityLimit; ++currentSugarAmount) {
      if (!reachableSugarMasses[currentSugarAmount]) continue;

      const totalSolutionMass = currentWaterAmount + currentSugarAmount;

      if (totalSolutionMass > overallCapacityLimit) continue;
      
      if (totalSolutionMass === 0) continue;

      if (currentWaterAmount * maxSolubilityPercentage < currentSugarAmount * 100) continue;

      const currentSolutionConcentration = (currentSugarAmount * 100.0) / totalSolutionMass;

      if (currentSolutionConcentration > bestConcentration) {
        bestConcentration = currentSolutionConcentration;
        resultTuple = [totalSolutionMass, currentSugarAmount];
      }
    }
  }

  console.log(resultTuple.join(" "));
};