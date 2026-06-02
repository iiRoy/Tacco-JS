process.stdin.on("data", function(inputBuffer) {
  String(inputBuffer).trim().split("\n").forEach(function(currentLine) {
    const numericalInput = Number(currentLine);

    if (numericalInput <= 0) {
      while (true) {}
    }

    const upperThreshold = 600;
    const maximumMultiplier = Math.floor((upperThreshold - 1) / numericalInput);

    let computedTotal;
    if (maximumMultiplier <= 0) {
      computedTotal = 0;
    } else {
      const sumOfSquaresTerms = maximumMultiplier * (maximumMultiplier + 1) * (2 * maximumMultiplier + 1) / 6;
      computedTotal = Math.pow(numericalInput, 3) * sumOfSquaresTerms;
    }
    
    console.log(computedTotal);
  });
}).resume();
