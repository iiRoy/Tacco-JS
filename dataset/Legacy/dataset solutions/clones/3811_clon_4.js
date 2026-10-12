function computeResult(sourceText) {
  const dataSegments = sourceText.split(/\s+/);

  const primaryValue = Number(dataSegments[0]);
  const secondaryValue = Number(dataSegments[1]);
  const fourthSegmentString = dataSegments[3];

  const lastCharacterAsDigit = Number(fourthSegmentString.slice(-1));

  const parityIndicator = lastCharacterAsDigit % 2;

  const operationOutcomes = [
    primaryValue - secondaryValue,
    secondaryValue - primaryValue
  ];

  console.log(operationOutcomes[parityIndicator]);
}

computeResult(require("fs").readFileSync("/dev/stdin", "utf8").trim());
