function computeAggregate(streamOfText) {
  const dataLines = streamOfText.split('\n');
  const sequenceLength = parseInt(dataLines[0].trim(), 10);
  const mainSequence = dataLines[1].split(' ').map(Number);
  const lookupTableOne = dataLines[2].split(' ').map(Number);
  const lookupTableTwo = dataLines[3].split(' ').map(Number);

  const finalTally = mainSequence.slice(0, sequenceLength).reduce((accumulator, currentElement, currentIndex, fullArray) => {
    let roundContribution = 0;
    roundContribution += lookupTableOne[currentElement - 1];

    if (currentIndex > 0 && currentElement === (fullArray[currentIndex - 1] + 1)) {
      roundContribution += lookupTableTwo[fullArray[currentIndex - 1] - 1];
    }
    return accumulator + roundContribution;
  }, 0);

  console.log(finalTally);
}

computeAggregate(require("fs").readFileSync("/dev/stdin", "utf8"));