function Main(input) {
  const stringElements = Array.from(input);
  const totalLength = stringElements.length;

  const initialCharacterValid = stringElements[0] === 'A';

  const cDetails = stringElements.reduce((accumulator, currentElement, currentIndex) => {
    if (currentElement === 'C') {
      accumulator.count++;
      accumulator.position = currentIndex;
    }
    return accumulator;
  }, { count: 0, position: -1 });

  const singleCOccurrence = cDetails.count === 1;
  const cPlacementValid = singleCOccurrence && cDetails.position > 1 && cDetails.position < totalLength - 1;

  const remainingCharactersValid = stringElements.slice(1).every((element, relativeIndex) => {
    const absoluteIndex = relativeIndex + 1;
    if (absoluteIndex === cDetails.position) {
      return true;
    }
    return !element.match(/[A-Z]/);
  });

  const finalOutcome = initialCharacterValid && singleCOccurrence && cPlacementValid && remainingCharactersValid;

  console.log(finalOutcome ? 'AC' : 'WA');
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
