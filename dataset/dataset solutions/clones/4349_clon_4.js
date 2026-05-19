function processSolutionData(rawInput) {
  const parsedValues = rawInput.split(" ").map(Number);
  const waterAUnit = parsedValues[0];
  const waterBUnit = parsedValues[1];
  const sugarCUnit = parsedValues[2];
  const sugarDUnit = parsedValues[3];
  const maxSolubilityRatio = parsedValues[4];
  const maxOverallWeight = parsedValues[5];

  let currentBestConcentration = 0;
  let optimalTotalWeight = 100 * waterAUnit;
  let optimalSugarWeight = 0;

  const availableWaterAmounts = new Set();
  for (let i = 0; ; i++) {
    const waterFromA = i * 100 * waterAUnit;
    if (waterFromA > maxOverallWeight) break;
    for (let j = 0; ; j++) {
      const totalWaterMass = waterFromA + j * 100 * waterBUnit;
      if (totalWaterMass > maxOverallWeight) break;
      if (totalWaterMass > 0) {
        availableWaterAmounts.add(totalWaterMass);
      }
    }
  }

  const availableSugarAmounts = new Set();
  for (let k = 0; ; k++) {
    const sugarFromC = k * sugarCUnit;
    if (sugarFromC > maxOverallWeight) break;
    for (let l = 0; ; l++) {
      const totalSugarMass = sugarFromC + l * sugarDUnit;
      if (totalSugarMass > maxOverallWeight) break;
      availableSugarAmounts.add(totalSugarMass);
    }
  }

  const waterMassList = Array.from(availableWaterAmounts);
  const sugarMassList = Array.from(availableSugarAmounts);

  for (const waterMass of waterMassList) {
    for (const sugarMass of sugarMassList) {
      const combinedMass = waterMass + sugarMass;

      if (combinedMass > maxOverallWeight) continue;
      if (sugarMass > (waterMass / 100) * maxSolubilityRatio) continue;
      
      // Skip cases with no water or no sugar if they don't improve concentration
      // The initial optimalTotalWeight and optimalSugarWeight handle the 0% concentration case.
      if (waterMass === 0 && sugarMass === 0) continue; 

      const currentConcentration = sugarMass / combinedMass;

      if (currentConcentration > currentBestConcentration) {
        currentBestConcentration = currentConcentration;
        optimalTotalWeight = combinedMass;
        optimalSugarWeight = sugarMass;
      }
    }
  }

  console.log(optimalTotalWeight, optimalSugarWeight);
}

processSolutionData(require("fs").readFileSync("/dev/stdin", "utf8"));
