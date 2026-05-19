( (rawInputContent) => {
  const getSortedCharsAsc = (inputString) => {
    return inputString.split('').sort().join('');
  };

  const getSortedCharsDesc = (inputString) => {
    return inputString.split('').sort().reverse().join('');
  };

  const inputLineArray = rawInputContent.split('\n');

  const processedDataArray = inputLineArray.map((currentSegment, segmentIndex) => {
    let modifiedSegment;
    if (segmentIndex === 0) {
      modifiedSegment = getSortedCharsDesc(currentSegment);
    } else {
      modifiedSegment = getSortedCharsAsc(currentSegment);
    }
    return modifiedSegment;
  });

  console.log(processedDataArray);

  const firstProcessedItem = processedDataArray[0];
  const secondProcessedItem = processedDataArray[1];

  const finalComparisonOutcome = firstProcessedItem > secondProcessedItem ? 'Yes' : 'No';
  console.log(finalComparisonOutcome);

})(require("fs").readFileSync("/dev/stdin", "utf8"));
