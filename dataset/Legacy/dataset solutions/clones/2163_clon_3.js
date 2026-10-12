function calculateMinCost(rawInputString) {
  let lines = rawInputString.split("\n");
  if (lines.length > 0 && lines[lines.length - 1] === '') {
    lines.pop();
  }
  const targetNumberStr = lines[0];

  let costToReachUp = 1;
  let costToReachDown = 0;

  let nextCostToReachUp;
  let nextCostToReachDown;

  for (let charIndex = 0; charIndex < targetNumberStr.length; charIndex++) {
    const currentDigit = Number(targetNumberStr[charIndex]);

    const optionForNextUpFromUp = (9 - currentDigit) + costToReachUp;
    const optionForNextUpFromDown = 1 + costToReachDown + currentDigit;
    nextCostToReachUp = Math.min(optionForNextUpFromUp, optionForNextUpFromDown);

    const optionForNextDownFromUp = (10 - currentDigit) + costToReachUp;
    const optionForNextDownFromDown = costToReachDown + currentDigit;
    nextCostToReachDown = Math.min(optionForNextDownFromUp, optionForNextDownFromDown);

    costToReachUp = nextCostToReachUp;
    costToReachDown = nextCostToReachDown;
  }

  console.log(costToReachDown);
}

calculateMinCost(require("fs").readFileSync("/dev/stdin", "utf8"));
