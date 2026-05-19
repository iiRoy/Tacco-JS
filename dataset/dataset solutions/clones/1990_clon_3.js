function processInput(rawData) {
  const lines = rawData.split('\n');
  const sequenceLength = Number(lines[0]);
  const charSequence = lines[1];

  const redIndices = [];
  const greenIndices = [];
  const blueIndices = [];

  const charArray = charSequence.split('');
  for (let charIndex = 0; charIndex < sequenceLength; charIndex++) {
    const currentChar = charArray[charIndex];
    if (currentChar === 'R') {
      redIndices.push(charIndex);
    } else if (currentChar === 'G') {
      greenIndices.push(charIndex);
    } else if (currentChar === 'B') {
      blueIndices.push(charIndex);
    }
  }

  let totalValidTriplets = redIndices.length * blueIndices.length * greenIndices.length;
  let equidistantDistinctTriplets = 0;

  for (let firstIndex = 0; firstIndex < sequenceLength; firstIndex++) {
    for (let secondIndex = firstIndex + 1; secondIndex < sequenceLength; secondIndex++) {
      const indexDifference = secondIndex - firstIndex;
      const thirdIndex = secondIndex + indexDifference;

      if (thirdIndex < sequenceLength) {
        const charAtFirst = charSequence[firstIndex];
        const charAtSecond = charSequence[secondIndex];
        const charAtThird = charSequence[thirdIndex];

        const areAllCharactersDistinct = (charAtFirst !== charAtSecond &&
                                          charAtSecond !== charAtThird &&
                                          charAtFirst !== charAtThird);

        if (areAllCharactersDistinct) {
          equidistantDistinctTriplets++;
        }
      }
    }
  }

  console.log(totalValidTriplets - equidistantDistinctTriplets);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
