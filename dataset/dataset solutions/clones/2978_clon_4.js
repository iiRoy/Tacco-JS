const processIncomingData = function(inputString) {
  const maximumQuantity = 3000;

  const extractNumbers = function(textualContent) {
    const numericFragments = textualContent.trim().split(" ");
    return numericFragments.map(parseFloat).filter(Number.isInteger);
  };

  const calculateCombinations = function(parsedValues) {
    if (parsedValues.length !== 4) {
      throw new Error("Input must contain exactly four integers.");
    }

    const [firstFactor, secondFactor, thirdFactor, targetSum] = parsedValues;

    const sequenceGenerator = (startPoint, endPoint) => {
      const collection = [];
      for (let idx = startPoint; idx <= endPoint; idx++) {
        collection.push(idx);
      }
      return collection;
    };

    const solutionCounter = sequenceGenerator(0, Math.min(maximumQuantity, Math.floor(targetSum / firstFactor)))
      .reduce((accumulatedCountForFirst, currentFirstCount) => {
        const remainingAfterFirst = targetSum - firstFactor * currentFirstCount;
        if (remainingAfterFirst < 0) return accumulatedCountForFirst;

        return accumulatedCountForFirst + sequenceGenerator(0, Math.min(maximumQuantity, Math.floor(remainingAfterFirst / secondFactor)))
          .reduce((accumulatedCountForSecond, currentSecondCount) => {
            const remainingAfterSecond = remainingAfterFirst - secondFactor * currentSecondCount;
            if (remainingAfterSecond < 0) return accumulatedCountForSecond;

            if (remainingAfterSecond % thirdFactor === 0) {
              const thirdCount = remainingAfterSecond / thirdFactor;
              if (thirdCount >= 0 && thirdCount <= maximumQuantity) {
                return accumulatedCountForSecond + 1;
              }
            }
            return accumulatedCountForSecond;
          }, 0);
      }, 0);

    return solutionCounter;
  };

  try {
    const extracted = extractNumbers(inputString);
    const totalSolutions = calculateCombinations(extracted);
    return `${totalSolutions}\n`;
  } catch (err) {
    console.error(`Processing error: ${err.message}`);
    // Re-throw or handle as appropriate for a program that crashes on bad input
    // The original uses unsafeCrashWith, so re-throwing is equivalent behavior.
    throw err;
  }
};

let allInputContent = '';

process.stdin.on('data', chunkPacket => {
  allInputContent += chunkPacket.toString();
});

process.stdin.on('end', () => {
  try {
    const finalResult = processIncomingData(allInputContent);
    process.stdout.write(finalResult);
  } catch (errorOutput) {
    process.stderr.write(`Execution terminated: ${errorOutput.message}\n`);
    process.exit(1);
  }
});

// The original code implicitly runs itself at the end of the bundle.
// This structure achieves the same immediate execution upon load.