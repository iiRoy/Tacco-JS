const analyzeSequence = (rawData) => {
  const allLines = rawData.split('\n');
  const dataLine = allLines[1];
  const itemStrings = dataLine.split(' ');

  const distinctItems = new Set(itemStrings);
  const distinctCount = distinctItems.size;

  const finalResult = (distinctCount % 2 === 1) ? distinctCount : distinctCount - 1;

  console.log(finalResult);
};

const processSystemInput = (pathToData) => {
  const fileContent = require("fs").readFileSync(pathToData, "utf8");
  analyzeSequence(fileContent);
};

processSystemInput("/dev/stdin");