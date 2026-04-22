function evaluateSequence(sourceContent) {
  const contentUnits = sourceContent.split('\n');
  const targetSequence = contentUnits[1];

  if (targetSequence.length === 0) {
    return 1;
  }

  const sequenceElements = targetSequence.split('');

  const mutationFlags = sequenceElements.slice(1).map((currentElement, position) => {
    return currentElement !== sequenceElements[position];
  });

  const totalMutations = mutationFlags.filter(wasChanged => wasChanged).length;

  const finalScore = 2 + totalMutations;
  return finalScore;
}

console.log(evaluateSequence(require("fs").readFileSync("/dev/stdin", "utf8")));