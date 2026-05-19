function processInput(rawData) {
  const lineSegments = rawData.split("\n");
  const initialValues = lineSegments[0].split(" ");

  const firstTokenValue = initialValues[0];
  const secondTokenValue = initialValues[1];

  console.log(firstTokenValue, a);

  return;
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
