function performCalculation(rawInputContent) {
  const processedString = rawInputContent.trim();
  const stringSegments = processedString.split(" ");
  const numericalComponents = stringSegments.map(segment => Number(segment));

  const firstValue = numericalComponents[0];
  const secondValue = numericalComponents[1];

  const finalResult = firstValue / secondValue;
  console.log(finalResult);
}

performCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));
