const processInput = (sourceText) => {
  const lineSegments = sourceText.split('\n');
  // The first line's value is not utilized in the original logic.
  const elementCollection = lineSegments[1].split(' ');

  const uniqueElementSet = new Set(elementCollection);
  const uniqueElementCount = uniqueElementSet.size;

  const resultValue = uniqueElementCount - (uniqueElementCount % 2 === 0 ? 1 : 0);
  console.log(resultValue);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
