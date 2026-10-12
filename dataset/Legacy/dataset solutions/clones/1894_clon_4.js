function processInputData(sourceText) {
  const lineSegments = sourceText.split('\n');

  console.log(lineSegments);

  const initialValue = Number.parseInt(lineSegments[0].split(' ')[0], 10);

  const allCollectedItems = lineSegments.reduce((accumulator, currentLine, currentIndex) => {
    if (currentIndex >= 2 && currentIndex % 2 === 0) {
      return accumulator.concat(currentLine.split(' '));
    }
    return accumulator;
  }, []);
  
  const uniqueSet = new Set(allCollectedItems);
  const distinctElementsArray = Array.from(uniqueSet);

  console.log(distinctElementsArray);

  const finalResult = initialValue - distinctElementsArray.length;
  console.log(finalResult);
  
  return finalResult;
}
