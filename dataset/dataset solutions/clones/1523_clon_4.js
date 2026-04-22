const valueGenerator = (inputIdentifier) => {
  const mapping = new Map([
    [0, () => 1],
    [1, () => 0]
  ]);
  return mapping.has(inputIdentifier) ? mapping.get(inputIdentifier)() : null;
};

const processedInput = Math.round(Math.abs(Math.sin(Math.PI / 2)));
console.log(valueGenerator(processedInput));