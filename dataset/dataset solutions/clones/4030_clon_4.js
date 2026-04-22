const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

const parseDataIntoGrid = (textualData) =>
  textualData.trim().split('\n').map(segment =>
    segment.split(' ').map(val => Number(val))
  );

const gridOfValues = parseDataIntoGrid(rawInputData);

let outcomeDetermined = false;

function evaluateCandidate(primaryColumnValue) {
  if (primaryColumnValue < 0 || primaryColumnValue > 100) {
    return;
  }

  const secondaryColumnValue = primaryColumnValue + gridOfValues[0][1] - gridOfValues[0][0];
  const tertiaryColumnValue = primaryColumnValue + gridOfValues[0][2] - gridOfValues[0][0];

  if (secondaryColumnValue < 0 || secondaryColumnValue > 100 ||
      tertiaryColumnValue < 0 || tertiaryColumnValue > 100) {
    return;
  }

  const firstRowValue = gridOfValues[0][0] - primaryColumnValue;
  const secondRowValue = gridOfValues[1][0] - primaryColumnValue;
  const thirdRowValue = gridOfValues[2][0] - primaryColumnValue;

  const verifyCell11 = gridOfValues[1][1] === secondaryColumnValue + secondRowValue;
  const verifyCell12 = gridOfValues[1][2] === tertiaryColumnValue + secondRowValue;
  const verifyCell21 = gridOfValues[2][1] === secondaryColumnValue + thirdRowValue;
  const verifyCell22 = gridOfValues[2][2] === tertiaryColumnValue + thirdRowValue;

  if (verifyCell11 && verifyCell12 && verifyCell21 && verifyCell22) {
    console.log("Yes");
    outcomeDetermined = true;
  }
}

const initialColumnCandidates = Array.from({ length: 101 }, (_, idx) => idx);

initialColumnCandidates.some(val => {
  evaluateCandidate(val);
  return outcomeDetermined;
});

if (!outcomeDetermined) {
  console.log("No");
}