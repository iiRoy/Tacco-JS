const checkStringStatus = (sourceString) => {
  const characterSequence = Array.from(sourceString);
  const sequenceTally = characterSequence.length;

  const evaluationResult = sequenceTally < 4 ? 1 : 0;

  console.log(evaluationResult);
};