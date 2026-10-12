function processInputData(rawDataString) {
  const rawTokens = rawDataString.split(' ');
  const tokenArray = rawTokens;

  const totalTokens = tokenArray.length;

  for (let currentIndex = 0; currentIndex < totalTokens; currentIndex++) {
    const currentToken = tokenArray[currentIndex];
    const targetValue = '0';

    if (currentToken === targetValue) {
      const oneBasedIndex = currentIndex + 1;
      console.log(oneBasedIndex);
    }
  }
}

const inputFilePath = '/dev/stdin';
const fileContent = require('fs').readFileSync(inputFilePath, 'utf8');
processInputData(fileContent);
