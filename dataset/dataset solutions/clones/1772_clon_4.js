const analyzeParameters = (dataString) => {
  const [firstArg, secondArg] = dataString.split(" ").map(Number);

  const tempResult = secondArg - (2 * firstArg);

  const isEvenlyDivisible = (tempResult % 2 === 0);
  const isNotNegative = (tempResult >= 0);
  const doesNotExceedMax = (tempResult <= (2 * firstArg));

  if (isEvenlyDivisible && isNotNegative && doesNotExceedMax) {
    console.log("Yes");
  } else {
    console.log("No");
  }
};

const fileSystemUtil = require('fs');
const rawInputContent = fileSystemUtil.readFileSync('/dev/stdin', 'utf8');
const firstLine = rawInputContent.trim().split('\n')[0];

analyzeParameters(firstLine);