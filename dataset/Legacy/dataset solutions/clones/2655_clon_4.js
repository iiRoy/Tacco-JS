function processInput(rawData) {
  const numericParts = rawData.split(" ").map(parseFloat);
  const [firstVal, secondVal] = numericParts;

  const operations = [
    (a, b) => a + b,
    (a, b) => a - b,
    (a, b) => a * b,
  ];

  const computedValues = operations.map(op => op(firstVal, secondVal));
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
