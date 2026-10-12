const processInput = (rawData) => {
  const numericValue = Number.parseInt(rawData.trim(), 10);

  const classificationRules = [
    { upperBoundary: 1200, outputLabel: "ABC" },
    { upperBoundary: 2800, outputLabel: "ARC" },
    { upperBoundary: Number.POSITIVE_INFINITY, outputLabel: "AGC" }
  ];

  const matchedCategory = classificationRules.find(
    (categoryDefinition) => numericValue < categoryDefinition.upperBoundary
  );

  console.log(matchedCategory.outputLabel);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
