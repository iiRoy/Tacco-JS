function processInputData(rawData) {
  const parseLine = (lineContent) => lineContent.split(" ");

  const processedLines = rawData.trim().split("\n").map(parseLine);

  const initialString = processedLines[0][0];
  const queryCount = parseInt(processedLines[1][0], 10);

  const queryList = [];
  for (let queryIdx = 0; queryIdx < queryCount; queryIdx++) {
    queryList.push(processedLines[queryIdx + 2]);
  }

  const initialStringLength = initialString.length;
  const bufferPadding = queryCount;
  const totalBufferSize = initialStringLength + (bufferPadding * 2);

  const stringBuffer = Array.from({ length: totalBufferSize }).fill('');

  let currentHeadIndex = bufferPadding;
  let currentTailIndex = bufferPadding + initialStringLength - 1;

  for (let charIdx = 0; charIdx < initialStringLength; charIdx++) {
    stringBuffer[charIdx + bufferPadding] = initialString.charAt(charIdx);
  }

  for (let queryIdx = 0; queryIdx < queryCount; queryIdx++) {
    const currentQuery = queryList[queryIdx];
    const queryOperationType = currentQuery[0];

    if (queryOperationType === '1') {
      stringBuffer.reverse();

      const oldHeadIndex = currentHeadIndex;
      const initialHeadOffset = bufferPadding;
      const initialTailOffset = bufferPadding + initialStringLength - 1;

      currentHeadIndex = initialHeadOffset - (currentTailIndex - initialTailOffset);
      currentTailIndex = initialTailOffset + (initialHeadOffset - oldHeadIndex);
      
      continue;
    }

    const addPositionIndicator = currentQuery[1];
    const charToInsert = currentQuery[2];

    if (addPositionIndicator === '1') {
      currentHeadIndex--;
      stringBuffer[currentHeadIndex] = charToInsert;
    } else {
      currentTailIndex++;
      stringBuffer[currentTailIndex] = charToInsert;
    }
  }

  console.log(stringBuffer.join(''));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
