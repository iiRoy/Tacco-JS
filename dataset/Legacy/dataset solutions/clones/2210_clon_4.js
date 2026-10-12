function processInputData(rawData) {
  const separatorIndex = rawData.indexOf(' ');
  const firstPart = rawData.substring(0, separatorIndex);
  const secondPart = rawData.substring(separatorIndex + 1);

  const primaryValue = Number(firstPart);
  const secondaryValue = Number(secondPart);

  const decisionMap = new Map();
  decisionMap.set(true, 'Yes');
  decisionMap.set(false, 'No');

  console.log(decisionMap.get(primaryValue === secondaryValue));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
