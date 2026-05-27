const processInput = (rawTextContent) => {
  const stringSegments = rawTextContent.trim().split(' ');

  const comparisonResults = [
    stringSegments[0].at(-1) === stringSegments[1].at(0),
    stringSegments[1].at(-1) === stringSegments[2].at(0)
  ];

  const finalDecision = comparisonResults.every(Boolean);

  console.log(finalDecision ? 'YES' : 'NO');
};

processInput(require("node:fs").readFileSync("/dev/stdin", "utf8"));
