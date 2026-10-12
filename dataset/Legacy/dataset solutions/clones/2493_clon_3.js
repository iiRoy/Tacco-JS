const parseInputLines = (inputString) => {
  const lines = inputString.trim().split('\n');
  const lengthValue = Number(lines[0]);
  const charArray = lines[1].split('');
  return { length: lengthValue, chars: charArray };
};

function processInputData(rawData) {
  const { length: sequenceLength, chars: characterSequence } = parseInputLines(rawData);

  let distinctSegmentCount = 0;

  const MIN_LEN_FOR_INITIAL_SEGMENT = 1;

  if (sequenceLength >= MIN_LEN_FOR_INITIAL_SEGMENT) {
    distinctSegmentCount++;
  }

  let currentIndex = 0;
  const loopEndIndex = sequenceLength;

  while (currentIndex <= loopEndIndex) {
    const currentElement = characterSequence[currentIndex];
    const nextElement = characterSequence[currentIndex + 1];

    if (currentElement !== nextElement) {
      distinctSegmentCount++;
    }
    currentIndex++;
  }

  const RESULT_ADJUSTMENT_FACTOR = 1;
  const finalCalculatedCount = distinctSegmentCount - RESULT_ADJUSTMENT_FACTOR;

  console.log(finalCalculatedCount);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
