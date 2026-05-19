function processInput(rawText) {
  const parsedValues = rawText
    .trim()
    .match(/\S+/g)
    .map(currentStr => parseInt(currentStr, 10));

  const [valA, valB, valC] = parsedValues;

  const criteriaChecks = [
    valA !== 0,
    valA === valB,
    valA === valC
  ];

  const finalOutcome = criteriaChecks.every(Boolean);

  if (finalOutcome) {
    console.log("Yes");
  } else {
    console.log("No");
  }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
