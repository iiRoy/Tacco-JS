function processData(inputString) {
  const inputLines = inputString.split('\n');
  const numericCount = Number(inputLines[0]);
  const initialValues = inputLines[1].split(' ').map(Number);

  const calculateMedianOfThree = (valA, valB, valC) => {
    return valA + valB + valC - Math.min(valA, valB, valC) - Math.max(valA, valB, valC);
  };

  const recursivelyReduceSequence = (currentSequence) => {
    if (currentSequence.length === 1) {
      return currentSequence[0];
    }

    const nextSequence = Array.from({ length: currentSequence.length - 2 }, (_, index) => {
      return calculateMedianOfThree(
        currentSequence[index],
        currentSequence[index + 1],
        currentSequence[index + 2]
      );
    });

    return recursivelyReduceSequence(nextSequence);
  };

  const finalResult = recursivelyReduceSequence(initialValues);

  console.log('%d', finalResult);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));
