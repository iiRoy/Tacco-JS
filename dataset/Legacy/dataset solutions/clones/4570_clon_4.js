function ProcessDimensions(sourceText) {
  const [dimensionLine] = sourceText.split('\n');
  const [heightValueString, widthValueString] = dimensionLine.split(' ');

  const heightDimension = Number(heightValueString);
  const widthDimension = Number(widthValueString);

  if (heightDimension % 3 === 0 || widthDimension % 3 === 0) {
    console.log(0);
    return;
  }

  const candidateValues = [];

  candidateValues.push(heightDimension);
  candidateValues.push(widthDimension);

  const deriveComplexTerm = (primarySize, secondarySize) => {
    // Original: primarySize/2 + secondarySize/3 - 1/6
    // Equivalent expression using common denominator 6: (3*primarySize + 2*secondarySize - 1) / 6
    return (3 * primarySize + 2 * secondarySize - 1) / 6;
  };

  if (heightDimension % 2 === 0) {
    candidateValues.push(heightDimension / 2);
  } else {
    candidateValues.push(deriveComplexTerm(heightDimension, widthDimension));
  }

  if (widthDimension % 2 === 0) {
    candidateValues.push(widthDimension / 2);
  } else {
    candidateValues.push(deriveComplexTerm(widthDimension, heightDimension));
  }

  const finalMinimumResult = Math.min(...candidateValues);

  console.log(Math.round(finalMinimumResult));
}

ProcessDimensions(require("fs").readFileSync("/dev/stdin", "utf8"));
