function processInputData(rawData) {
  const lineSegments = rawData.trim().split("\n");

  const firstLineParts = lineSegments[0].split(' ');
  const requiredThreshold = Number(firstLineParts[0]);
  const itemCount = Number(firstLineParts[1]);

  const valueList = lineSegments[1].split(' ').map(Number);

  let currentSum = 0;
  for (const singleValue of valueList) {
    currentSum += singleValue;
  }

  const outcomeMap = {
    true: 'Yes',
    false: 'No'
  };
  const finalResult = outcomeMap[String(currentSum >= requiredThreshold)];

  console.log(finalResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
