const processData = (inputTxt) => {
  const [valCount, valMultiplier] = String(inputTxt).split(/\s+/).map(Number);

  const calculateSeriesProduct = (initialTerm, commonFactor, iterations) => {
    if (iterations === 0) {
      return 0;
    }
    // For iterations >= 1, the result is initialTerm * (commonFactor ^ (iterations - 1))
    const exponent = iterations - 1;
    
    // Calculate commonFactor raised to the power of 'exponent' using functional reduction.
    // If exponent is 0, Array.from creates an empty array, and reduce returns the initial accumulator (1).
    const powerResult = Array.from({ length: exponent }).reduce((product, _) => product * commonFactor, 1);
    
    return initialTerm * powerResult;
  };

  const finalOutcome = calculateSeriesProduct(valMultiplier, valMultiplier - 1, valCount);

  const presentOutput = (valueToDisplay) => {
    process.stdout.write(valueToDisplay.toString() + "\n");
  };

  presentOutput(finalOutcome);
};

processData(require("node:fs").readFileSync(0, "utf8"));