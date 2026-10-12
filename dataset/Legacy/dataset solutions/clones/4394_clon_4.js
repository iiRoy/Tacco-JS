const processInput = (rawText) => {
  const numericValues = rawText.split(' ').map(parseFloat);
  const targetValue = numericValues[0];
  const firstCandidate = numericValues[1];
  const secondCandidate = numericValues[2];

  const distanceSqA = (targetValue - firstCandidate) ** 2;
  const distanceSqB = (targetValue - secondCandidate) ** 2;

  const resultChar = distanceSqA > distanceSqB ? 'B' : 'A';
  console.log(resultChar);
};

processInput(require("node:fs").readFileSync("/dev/stdin", "utf8"));
