const computeResult = (sourceText) => {
  const [initialValue, subtractor] = sourceText
    .trim()
    .split('\n')
    .map(Number);

  console.log(Math.pow(initialValue, 2) - subtractor);
};

computeResult(require("fs").readFileSync("/dev/stdin", "utf8"));
