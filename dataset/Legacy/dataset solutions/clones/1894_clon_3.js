function Main(rawData) {
  const lines = rawData.split("\n");

  console.log(lines);

  const parseFirstNumericToken = (lineContent) => {
    const firstToken = lineContent.split(" ")[0];
    return parseInt(firstToken, 10);
  };

  const initialValue = parseFirstNumericToken(lines[0]);

  let collectedElements = [];

  const LINE_INCREMENT_STEP = 2;

  for (let currentLineIdx = LINE_INCREMENT_STEP; currentLineIdx < lines.length; currentLineIdx += LINE_INCREMENT_STEP) {
    const lineParts = lines[currentLineIdx].split(" ");
    collectedElements.push(...lineParts);
  }

  const distinctElements = getUniqueElements(collectedElements);

  console.log(distinctElements);

  const finalCalculatedResult = initialValue - distinctElements.length;

  console.log(finalCalculatedResult);

  return finalCalculatedResult;
}

function getUniqueElements(sourceArray) {
  const uniqueSet = new Set(sourceArray);
  return Array.from(uniqueSet);
}
