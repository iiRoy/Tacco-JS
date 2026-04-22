function processMeasurementData(rawText) {
  const allLines = rawText.split(/\r?\n/).filter(l => l.trim().length > 0);

  const entryCount = Number(allLines[0]);

  const dataPairs = allLines.slice(1, entryCount + 1).map(lineContent => {
    const parts = lineContent.split(' ').map(s => Number(s));
    return [parts[0], parts[1]];
  });

  const sortedFirstElements = dataPairs
    .map(pair => pair[0])
    .sort((a, b) => a - b);

  const sortedSecondElements = dataPairs
    .map(pair => pair[1])
    .sort((a, b) => b - a);

  const centralIndex = Math.floor(entryCount / 2);

  const effectiveIndex = (entryCount % 2 === 0) ? (centralIndex - 1) : centralIndex;

  const differenceTerm = sortedSecondElements[effectiveIndex] - sortedFirstElements[effectiveIndex];

  const finalResult = differenceTerm * ((entryCount % 2 === 0) ? 2 : 1) + ((entryCount % 2 === 0) ? -1 : 1);

  console.log(finalResult.toString());
  return finalResult;
}

processMeasurementData(require("fs").readFileSync("/dev/stdin", "utf8"));