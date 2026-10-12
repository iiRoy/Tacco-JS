function processSequence(sourceData) {
  const fullNumericStream = Array.from(sourceData, (digitChar) => Number(digitChar));

  const totalElements = fullNumericStream.length;

  const alternatingMatchTally = fullNumericStream.reduce((currentTally, elementValue, elementIndex) => {
    const expectedPatternValue = elementIndex % 2;
    return currentTally + (elementValue === expectedPatternValue ? 1 : 0);
  }, 0);

  const finalOutcome = Math.min(totalElements - alternatingMatchTally, alternatingMatchTally);

  console.log(finalOutcome);
}

processSequence(require("fs").readFileSync("/dev/stdin", "utf8"));
