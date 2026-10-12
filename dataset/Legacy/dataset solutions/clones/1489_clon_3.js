function processInputData(rawInputString) {
  const lines = rawInputString.split("\n");
  const processedLines = lines.map(lineContent => lineContent.split(" "));
  
  const initialLength = convertToInt(processedLines[0][0]);
  const numQueries = convertToInt(processedLines[0][1]);
  
  const baseSequence = Array(initialLength).fill("1");
  
  for (let queryIdx = 0; queryIdx < numQueries; queryIdx++) {
    const currentQueryDetails = processedLines[queryIdx + 1];
    const rangeStart = convertToInt(currentQueryDetails[0]) - 1;
    const rangeEnd = convertToInt(currentQueryDetails[1]) - 1;
    const fillDigit = currentQueryDetails[2];
    
    const segmentResultArray = baseSequence.map((charValue, charIndex) => {
      const isWithinRange = charIndex >= rangeStart && charIndex <= rangeEnd;
      return isWithinRange ? fillDigit : charValue;
    });
    
    const joinedSegmentString = segmentResultArray.join('');
    const finalNumericValue = convertToInt(joinedSegmentString);
    console.log(finalNumericValue % 998244353);
  }
}

function convertToInt(strValue) {
    return parseInt(strValue, 10);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
