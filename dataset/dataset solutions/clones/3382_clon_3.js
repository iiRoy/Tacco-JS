function processInput(rawData) {
  const lines = rawData.split("\n");
  const firstLineParts = lines[0].split(" ");
  const divisorCount = parseInt(firstLineParts[0], 10);
  let targetProduct = parseInt(firstLineParts[1], 10);

  const factorGroups = [];
  const halfTargetProductLimit = Math.ceil(targetProduct / 2);

  let groupIndex = -1;
  let currentFactorCount = 0;
  let currentDivisor = 2;

  while (currentDivisor < halfTargetProductLimit) {
    if (targetProduct % currentDivisor === 0) {
      if (currentFactorCount === 0) {
        groupIndex++;
        factorGroups.push([currentDivisor, 0]);
      }
      currentFactorCount++;
      factorGroups[groupIndex][1] = currentFactorCount;
      targetProduct /= currentDivisor;
    } else {
      currentDivisor++;
      currentFactorCount = 0;
    }

    if (targetProduct === 1) {
      break;
    }
  }

  let resultValue = 1;

  const calculateFactorContribution = (factorInfo, nValue) => {
    const base = factorInfo[0];
    const exponentCount = factorInfo[1];
    const requiredExponent = Math.floor(exponentCount / nValue);
    return Math.max(Math.pow(base, requiredExponent), 1);
  };

  for (let i = 0; i < factorGroups.length; i++) {
    resultValue *= calculateFactorContribution(factorGroups[i], divisorCount);
  }

  console.log('%s', resultValue);
}

function debug() {
  var input = document.getElementById("input").value;
  processInput(input);
}
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
