const inputData = require('fs').readFileSync('/dev/stdin', 'utf8');

const processInput = (rawContent) => {
  const [firstLine, secondLine] = rawContent.trim().split('\n');
  const [totalPoints, selectedPoints] = firstLine.split(' ').map(Number);
  const pointValues = secondLine.split(' ').map(Number);
  return { totalPoints, selectedPoints, pointValues };
};

const calculateMinimumSpan = ({ totalPoints, selectedPoints, pointValues }) => {
  if (selectedPoints >= totalPoints) {
    return 0;
  }

  const sortedValues = [...pointValues].sort((a, b) => a - b);

  const adjacentDifferences = sortedValues.slice(1).map((current, index) => current - sortedValues[index]);

  const orderedDifferences = adjacentDifferences.sort((a, b) => a - b);

  const differencesToKeep = totalPoints - selectedPoints;

  const sumOfSmallestDifferences = orderedDifferences.slice(0, differencesToKeep).reduce((accumulator, currentDifference) => accumulator + currentDifference, 0);

  return sumOfSmallestDifferences;
};

const { totalPoints, selectedPoints, pointValues } = processInput(inputData);
const finalResult = calculateMinimumSpan({ totalPoints, selectedPoints, pointValues });
console.log(finalResult);
