const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineIterator = rawData.split('\n')[Symbol.iterator]();
const getNextInputLine = () => lineIterator.next().value;
const initialValue = Number.parseInt(getNextInputLine().split(' ')[0], 10);
const pathCosts = Array.from({ length: 10 }, () => getNextInputLine().split(' ').map(Number.parseInt));
const frequencyMap = new Uint32Array(10);
Array.from({ length: initialValue }, () => getNextInputLine())
  .flatMap(lineContent => lineContent.split(' ').map(Number.parseInt))
  .forEach(digitVal => frequencyMap[digitVal]++);
Array.from({ length: 10 }, (_, k_idx) => k_idx).forEach(k_idx => {
  Array.from({ length: 10 }, (_, i_idx) => i_idx).forEach(i_idx => {
    Array.from({ length: 10 }, (_, j_idx) => j_idx).forEach(j_idx => {
      pathCosts[i_idx][j_idx] = Math.min(pathCosts[i_idx][j_idx], pathCosts[i_idx][k_idx] + pathCosts[k_idx][j_idx]);
    });
  });
});
let totalCost = 0;
for (let digit = 0; digit < 10; ++digit) {
  totalCost += frequencyMap[digit] * pathCosts[digit][1];
}
console.log(totalCost);
