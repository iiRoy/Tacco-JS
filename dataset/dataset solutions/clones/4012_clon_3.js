'use strict'

function processInput(inputString) {

  const extractNames = (rawInput) => {
    const lines = rawInput.split('\n');
    return lines.slice(1, -1);
  };

  const candidateNames = extractNames(inputString);

  const targetInitialLetters = ['M', 'A', 'R', 'C', 'H'];
  const initialCounts = new Array(targetInitialLetters.length).fill(0);

  for (const currentName of candidateNames) {
    const firstChar = currentName[0];
    const charIndex = targetInitialLetters.indexOf(firstChar);
    if (charIndex !== -1) {
      initialCounts[charIndex]++;
    }
  }

  let finalResult = 0;

  const calculateProduct = (factors) => {
    let productAccumulator = 1;
    for (const factorValue of factors) {
      productAccumulator *= factorValue;
    }
    return productAccumulator;
  };

  const generateCombinations = (
    currentIndex,
    currentProductFactors,
    availableCounts
  ) => {
    const totalCategories = availableCounts.length;

    if (currentIndex === totalCategories) {
      const requiredFactorCount = 3;
      if (currentProductFactors.length === requiredFactorCount) {
        finalResult += calculateProduct(currentProductFactors);
      }
      return;
    }

    const factorsIncludingCurrent = [...currentProductFactors, availableCounts[currentIndex]];
    generateCombinations(currentIndex + 1, factorsIncludingCurrent, availableCounts);

    generateCombinations(currentIndex + 1, currentProductFactors, availableCounts);
  };

  generateCombinations(0, [], initialCounts);

  console.log(finalResult);

}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
