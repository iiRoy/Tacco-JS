function processCardGateData(rawInputString) {
  const inputLines = rawInputString.split("\n");

  const firstLineParts = inputLines[0].split(" ");
  const totalCardCount = parseInt(firstLineParts[0], 10);
  const gateCount = parseInt(firstLineParts[1], 10);

  let currentValidMin = 1;
  let currentValidMax = totalCardCount;

  const extractGateLimits = (lineContent) => {
    const limitStrings = lineContent.split(" ");
    const lowerBound = Number(limitStrings[0]);
    const upperBound = Number(limitStrings[1]);
    return [lowerBound, upperBound];
  };

  for (let gateIndex = 1; gateIndex <= gateCount; gateIndex++) {
    const gateBounds = extractGateLimits(inputLines[gateIndex]);
    const gateLowerBound = gateBounds[0];
    const gateUpperBound = gateBounds[1];

    currentValidMin = Math.max(gateLowerBound, currentValidMin);
    currentValidMax = Math.min(gateUpperBound, currentValidMax);
  }

  let finalPossibleCards = 0;
  if (currentValidMax >= currentValidMin) {
    finalPossibleCards = currentValidMax - currentValidMin + 1;
  }

  console.log(finalPossibleCards);
}

processCardGateData(require("fs").readFileSync("/dev/stdin", "utf8"));
