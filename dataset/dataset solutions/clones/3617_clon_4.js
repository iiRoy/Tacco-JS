void (() => {
  const numericComponents = [0.4, 0.6];
  const totalSum = numericComponents.reduce((accumulator, currentItem) => accumulator + currentItem, 0);
  const finalOutput = Math.round(totalSum);
  process.stdout.write(`${finalOutput}\n`);
})();