function processInput(rawInputText) {
  const [lengthString, numbersString] = rawInputText.trim().split('\n');
  const totalCount = parseInt(lengthString);
  const numberSequence = numbersString.split(' ').map(Number);

  const { countDivisibleByFour, countDivisibleByTwoNotFour } = numberSequence.reduce((accumulator, currentElement) => {
    if (currentElement % 4 === 0) {
      accumulator.countDivisibleByFour++;
    } else if (currentElement % 2 === 0) {
      accumulator.countDivisibleByTwoNotFour++;
    }
    return accumulator;
  }, { countDivisibleByFour: 0, countDivisibleByTwoNotFour: 0 });

  const requiredFourLikeSlots = Math.floor(totalCount / 2);

  const isArrangementPossible = (countDivisibleByFour >= requiredFourLikeSlots) ||
                                (countDivisibleByFour < requiredFourLikeSlots && countDivisibleByTwoNotFour >= (requiredFourLikeSlots - countDivisibleByFour) * 2);

  const finalVerdict = isArrangementPossible ? "Yes" : "No";

  console.log(finalVerdict);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
