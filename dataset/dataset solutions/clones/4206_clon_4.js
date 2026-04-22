function performAnalysis(rawData) {
  const cleanedData = String(rawData).replace(/^[ \t\n\r]+|[ \t\n\r]+$/g, '');

  const alphaCount = [...cleanedData].filter(x => x === 'a').length;
  const betaCount = [...cleanedData].filter(x => x === 'b').length;
  const gammaCount = [...cleanedData].filter(x => x === 'c').length;

  const countsArray = [alphaCount, betaCount, gammaCount];
  countsArray.sort((p, q) => p - q);

  const minimumCount = countsArray[0];
  const maximumCount = countsArray[countsArray.length - 1];

  let conclusion = '';
  if (maximumCount - minimumCount < 2) {
    conclusion = 'YES';
  } else {
    conclusion = 'NO';
  }
  console.log(conclusion);
}

const nodeUtils = typeof module !== 'undefined' && module.exports && require;
const fileContent = nodeUtils('fs').readFileSync('/dev/stdin', 'utf8');
performAnalysis(fileContent);