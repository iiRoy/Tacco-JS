function analyzeInputStrings(rawDataStream) {
  const [segmentOne, segmentTwo, ...remainingSegments] = rawDataStream.split('\n');

  const comparisonOutcomes = [
    segmentOne.charAt(0) === segmentTwo.charAt(0),
    segmentOne.charAt(1) === segmentTwo.charAt(1),
    segmentOne.charAt(2) === segmentTwo.charAt(2)
  ];

  const equivalentPositions = comparisonOutcomes.filter(truthValue => truthValue).length;

  console.log(equivalentPositions);
}

analyzeInputStrings(require("fs").readFileSync("/dev/stdin", "utf8"));