(function () {
  const sourceText = require('fs').readFileSync('/dev/stdin', 'utf8');

  let textLines = [];
  let currentLineBuffer = '';
  for (let charIndex = 0; charIndex < sourceText.length; charIndex++) {
    if (sourceText[charIndex] === '\n') {
      textLines.push(currentLineBuffer);
      currentLineBuffer = '';
    } else {
      currentLineBuffer += sourceText[charIndex];
    }
  }
  if (currentLineBuffer.length > 0) { // Capture the last line if no trailing newline
      textLines.push(currentLineBuffer);
  }

  let firstLineData = [];
  let currentNumberString = '';
  const firstLineContent = textLines[0];
  for (let charIndex = 0; charIndex < firstLineContent.length; charIndex++) {
    if (firstLineContent[charIndex] === ' ') {
      firstLineData.push(Number(currentNumberString));
      currentNumberString = '';
    } else {
      currentNumberString += firstLineContent[charIndex];
    }
  }
  firstLineData.push(Number(currentNumberString)); // Add the last number in the first line

  const totalItemsCount = firstLineData[0];
  const maximumCapacity = firstLineData[1];

  let itemRecords = [];
  for (let lineIndex = 1; lineIndex < textLines.length; lineIndex++) {
    const currentLine = textLines[lineIndex];
    if (currentLine.trim() === '') continue; // Skip empty lines

    let itemDetails = [];
    currentNumberString = '';
    for (let charIndex = 0; charIndex < currentLine.length; charIndex++) {
      if (currentLine[charIndex] === ' ') {
        itemDetails.push(Number(currentNumberString));
        currentNumberString = '';
      } else {
        currentNumberString += currentLine[charIndex];
      }
    }
    itemDetails.push(Number(currentNumberString)); // Add the last number in the item line
    itemRecords.push(itemDetails);
  }

  const memoizationCache = new Map();
  let globalMaximum = 0;

  function computeValue(elementIndex, currentLoadLimit) {
    if (currentLoadLimit < 0) {
      return 0; // Negative capacity means no value can be obtained
    }
    if (elementIndex < 0) {
      return 0; // No more elements to consider, zero value
    }

    const lookupKey = `${elementIndex}_${currentLoadLimit}`;
    if (memoizationCache.has(lookupKey)) {
      return memoizationCache.get(lookupKey);
    }

    const currentElement = itemRecords[elementIndex];
    const elementWeight = currentElement[0];
    const elementWorth = currentElement[1];

    let valueWithoutCurrent = computeValue(elementIndex - 1, currentLoadLimit);

    let finalCalculatedWorth;
    if (elementWeight <= currentLoadLimit) {
      let valueIfElementTaken = computeValue(elementIndex - 1, currentLoadLimit - elementWeight) + elementWorth;
      // Equivalent to Math.max(0, valueIfElementTaken)
      finalCalculatedWorth = (0 > valueIfElementTaken) ? 0 : valueIfElementTaken;
    } else {
      finalCalculatedWorth = valueWithoutCurrent;
    }

    memoizationCache.set(lookupKey, finalCalculatedWorth);
    if (finalCalculatedWorth > globalMaximum) {
      globalMaximum = finalCalculatedWorth;
    }
    return finalCalculatedWorth;
  }

  computeValue(totalItemsCount - 1, maximumCapacity);

  console.log(globalMaximum);
})();