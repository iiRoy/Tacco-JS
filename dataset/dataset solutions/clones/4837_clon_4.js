const processData = (sourceMaterial) => {
  const numericComponents = sourceMaterial.split(' ').map(val => parseInt(val, 10));
  const startingPoint = numericComponents[0];
  const endingPoint = numericComponents[1];
  const incrementFactor = numericComponents[2];

  if (incrementFactor === 0) {
    console.log(0);
    return;
  }

  const firstQualified = Math.ceil(startingPoint / incrementFactor) * incrementFactor;
  const lastQualified = Math.floor(endingPoint / incrementFactor) * incrementFactor;

  if (firstQualified > endingPoint) {
    console.log(0);
  } else {
    const totalOccurrences = (lastQualified - firstQualified) / incrementFactor + 1;
    console.log(totalOccurrences);
  }
};

processData(require("node:fs").readFileSync("/dev/stdin", "utf8"));