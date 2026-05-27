let accumulatedInput = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (inputChunk) => {
  accumulatedInput += inputChunk;
});

process.stdin.on('end', () => {
  const processedLines = accumulatedInput.split('\n').filter(Boolean);

  processedLines.forEach((currentInputLine) => {
    const numericalComponents = currentInputLine.split(' ').map(Number);

    if (numericalComponents[0] || numericalComponents[1] || numericalComponents[2]) {
      const firstInputVal = Math.floor(numericalComponents[0]);
      const secondInputVal = Math.floor(numericalComponents[1]);
      const targetConstraint = Math.floor(numericalComponents[2]);

      const multiplierAlpha = firstInputVal / 100 + 1;
      const multiplierBeta = secondInputVal / 100 + 1;

      let overallMaximum = 0;

      const valueToSourceIndices = new Map();
      const iterationCeiling = 1000;

      for (let currentIdx = 1; currentIdx < iterationCeiling; ++currentIdx) {
        const derivedValue = Math.floor(currentIdx * multiplierAlpha);
        if (!valueToSourceIndices.has(derivedValue)) {
          valueToSourceIndices.set(derivedValue, []);
        }
        valueToSourceIndices.get(derivedValue).push(currentIdx);
      }

      for (const [alphaValI, indicesForAlphaI] of valueToSourceIndices.entries()) {
        const requiredAlphaValJ = targetConstraint - alphaValI;

        if (valueToSourceIndices.has(requiredAlphaValJ)) {
          const indicesForAlphaJ = valueToSourceIndices.get(requiredAlphaValJ);

          for (const actualI of indicesForAlphaI) {
            for (const actualJ of indicesForAlphaJ) {
              const currentComputedSum = Math.floor(actualI * multiplierBeta) + Math.floor(actualJ * multiplierBeta);
              overallMaximum = Math.max(overallMaximum, currentComputedSum);
            }
          }
        }
      }
      console.log(overallMaximum);
    }
  });
});
