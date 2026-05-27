function solveProblem(dataInput) {
  const modulusVal = Number(dataInput[0][1]);

  const numSequence = dataInput[1].map(Number).map(element => element % modulusVal);

  let totalMatches = 0;
  let currentPrefixMod = 0; 
  
  const valueCounts = new Map();
  
  const historyOfValues = [0]; 
  valueCounts.set(0, 1);

  for (let idx = 0; idx < numSequence.length; idx++) {
    currentPrefixMod = (currentPrefixMod + numSequence[idx]) % modulusVal;

    let currentTransformedVal = (currentPrefixMod - (idx + 1)) % modulusVal;
    
    currentTransformedVal = (currentTransformedVal + modulusVal) % modulusVal;
    
    historyOfValues.push(currentTransformedVal);

    const removalIndex = idx + 1 - modulusVal;

    if (removalIndex >= 0) {
      const valToRemove = historyOfValues[removalIndex];
      valueCounts.set(valToRemove, valueCounts.get(valToRemove) - 1);
    }

    totalMatches += valueCounts.get(currentTransformedVal) || 0;

    valueCounts.set(currentTransformedVal, (valueCounts.get(currentTransformedVal) || 0) + 1);
  }

  console.log(totalMatches);
}

solveProblem(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n").map(line => line.split(' ')));
