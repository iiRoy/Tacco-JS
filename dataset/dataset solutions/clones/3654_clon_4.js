const solveCyclicEquivalence = (primaryString, secondaryString) => {
  const primaryLength = primaryString.length;
  const secondaryLength = secondaryString.length;

  return (primaryLength === secondaryLength) &&
         (`${primaryString}${primaryString}`).includes(secondaryString);
};

const executeProgram = (inputLines) => {
  const initialSegment = inputLines[0];
  const comparativeSegment = inputLines[1];

  const outcome = solveCyclicEquivalence(initialSegment, comparativeSegment);

  console.log(outcome ? "Yes" : "No");
};

const rawContentStream = require('node:fs').readFileSync(0, 'utf8');
const processedLines = rawContentStream.trim().split('\n');

executeProgram(processedLines);