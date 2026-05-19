const processInput = (rawData) => {
  const inputLines = rawData.trim().split('\n');

  const elementCount = Number(inputLines[0]);
  const dataValues = inputLines[1].split(' ').map(Number);

  const verifyXorRelation = (arr, idxA, idxB, idxC) => {
    const valA = arr[idxA];
    const valB = arr[idxB];
    const valC = arr[idxC];
    return (valA ^ valC) === valB;
  };

  const mainSequenceSatisfied = Array.from(
    { length: Math.max(0, elementCount - 2) },
    (_, k) => k + 1
  ).every(currentIdx =>
    verifyXorRelation(dataValues, currentIdx - 1, currentIdx, currentIdx + 1)
  );

  let finalOutcome = mainSequenceSatisfied;

  if (finalOutcome) {
    const firstWrapCondition = verifyXorRelation(dataValues, elementCount - 2, elementCount - 1, 0);
    finalOutcome = finalOutcome && firstWrapCondition;
  }

  if (finalOutcome) {
    const secondWrapCondition = verifyXorRelation(dataValues, 1, 0, elementCount - 1);
    finalOutcome = finalOutcome && secondWrapCondition;
  }

  const outputMessage = finalOutcome ? 'Yes' : 'No';

  console.log('%s', outputMessage);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
