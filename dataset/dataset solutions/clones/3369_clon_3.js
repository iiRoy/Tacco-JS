function processInputData(rawData) {
  const lineDelimiter = '\n';
  const valueDelimiter = ' ';

  const linesArray = rawData.split(lineDelimiter);

  const parseTwoNumbers = (lineString) => {
    const parts = lineString.split(valueDelimiter);
    const num1 = parseInt(parts[0], 10);
    const num2 = parseInt(parts[1], 10);
    return [num1, num2];
  };

  const initialLineParts = linesArray[0].split(valueDelimiter);
  const minHeight = parseInt(initialLineParts[1], 10);
  const minWidth = parseInt(initialLineParts[2], 10);

  let validPairCount = 0;

  for (let dataLineIdx = 1; dataLineIdx < linesArray.length; dataLineIdx++) {
    const currentLineContent = linesArray[dataLineIdx];

    if (!currentLineContent.trim()) {
      continue;
    }

    const [itemHeight, itemWidth] = parseTwoNumbers(currentLineContent);

    const isHeightMeetingThreshold = itemHeight >= minHeight;
    const isWidthMeetingThreshold = itemWidth >= minWidth;

    if (isHeightMeetingThreshold && isWidthMeetingThreshold) {
      validPairCount++;
    }
  }

  console.log(validPairCount);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
