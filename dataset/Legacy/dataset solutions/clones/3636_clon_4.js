function evaluateScore(dataString) {
  const scoreValue = parseInt(dataString, 10);

  const categoryDefinitions = [
    { upperBoundary: 1200, label: 'ABC' },
    { upperBoundary: 2800, label: 'ARC' },
    { upperBoundary: Infinity, label: 'AGC' }
  ];

  const finalCategory = categoryDefinitions.find(
    (def) => scoreValue < def.upperBoundary
  ).label;

  console.log(finalCategory);
}

evaluateScore(require("fs").readFileSync("/dev/stdin", "utf8"));
