const main = (input) => {
  const primeDivisor = (10**9 + 7);
  const targetValue = Number(input.trim());

  const combinationCounts = new Array(targetValue + 1).fill(0);
  combinationCounts[0] = 1;

  for (let k = 3; k <= targetValue; k++) {
    const previousOne = combinationCounts[k - 1];
    const previousThree = combinationCounts[k - 3];
    combinationCounts[k] = (previousOne + previousThree) % primeDivisor;
  }

  const finalResult = combinationCounts[targetValue];
  console.log((finalResult % primeDivisor + primeDivisor) % primeDivisor);
};

process.env.MYTEST
  ? (process.env.MYTEST === 'test' ? test() : main(require('fs').readFileSync('dev/stdin', 'utf8')))
  : main(require('fs').readFileSync('/dev/stdin', 'utf8'));
