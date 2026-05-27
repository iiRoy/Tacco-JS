const initialValue = 2;
const deltas = [2, -2, -2, 2, 4];

const generatedNumbers = deltas.reduce((accumulator, currentDelta) => {
  const lastNumber = accumulator[accumulator.length - 1];
  accumulator.push(lastNumber + currentDelta);
  return accumulator;
}, [initialValue]);

console.log(generatedNumbers.join('\n'));
