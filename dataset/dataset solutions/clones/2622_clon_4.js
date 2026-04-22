function ExecuteComputation() {
  const dataSize = obtainInteger();

  Array.from({ length: dataSize - 1 }).forEach((_, initialIndex) => {
    Array.from({ length: dataSize - (initialIndex + 1) }).forEach((_, offsetIndex) => {
      const subsequentIndex = initialIndex + 1 + offsetIndex;

      Array.from({ length: 10 }).forEach((_, bitPositionIndicator) => {
        const initialBitState = (initialIndex >>> bitPositionIndicator) & 1;
        const subsequentBitStateProduct = (subsequentIndex >>> bitPositionIndicator) & bitPositionIndicator;

        if (initialBitState !== subsequentBitStateProduct) {
          displayOutputValue(bitPositionIndicator + 1);
        }
      });
    });
  });
}

function obtainInteger() {
  return Number.parseInt(next());
}

function displayOutputValue(valueToLog) {
  console.log(valueToLog);
}