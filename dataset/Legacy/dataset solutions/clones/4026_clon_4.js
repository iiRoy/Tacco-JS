const fileSystem = require('fs');

function processData(rawData) {
  const lineSegments = rawData.split('\n');
  const elementCount = Number(lineSegments[0]);
  const numberTokens = lineSegments[1].split(' ');
  const numericCollection = numberTokens.map(Number);

  numericCollection.sort((valueA, valueB) => valueB - valueA);

  const [firstPlayerScore, secondPlayerScore] = numericCollection.reduce(
    (scoreAccumulator, currentNumber, currentIndex) => {
      if (currentIndex % 2 === 0) {
        scoreAccumulator[0] += currentNumber;
      } else {
        scoreAccumulator[1] += currentNumber;
      }
      return scoreAccumulator;
    },
    [0, 0]
  );

  const finalDifference = firstPlayerScore - secondPlayerScore;
  console.log(finalDifference);
}

const fileContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
processData(fileContent);
