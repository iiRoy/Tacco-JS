function processInputData(rawData) {
  const tokenArray = rawData.trim().split(' ');

  const firstNum = parseInt(tokenArray[0], 10);
  const secondNum = parseInt(tokenArray[1], 10);

  const scoreRegistry = new Map([
    [1, 300000],
    [2, 200000],
    [3, 100000]
  ]);

  const fetchComponentScore = (val) => scoreRegistry.get(val) || 0;

  const baseSum = fetchComponentScore(firstNum) + fetchComponentScore(secondNum);

  const specialBonus = (firstNum === 1 && secondNum === 1) ? 400000 : 0;

  const totalResult = baseSum + specialBonus;

  console.log(totalResult);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
