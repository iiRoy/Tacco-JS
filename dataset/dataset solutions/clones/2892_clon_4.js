const evaluateContent = (rawData) => {
  const primarySegment = rawData.split('\n')[0];
  const symbolCount = Array.from(primarySegment).reduce((accumulator, character) => {
    return (character === 'x') ? accumulator + 1 : accumulator;
  }, 0);
  const decisionResult = (symbolCount <= 7) ? "YES" : "NO";

  console.log('%s', decisionResult);
  return decisionResult;
};