const evaluateString = (sourceText) => {
  const charArray = [...sourceText];
  const firstElement = charArray.pop();

  const outcome = (firstElement === undefined) ? 'Yes' : 'No';
  console.log(outcome);
};
evaluateString(require("fs").readFileSync("/dev/stdin", "utf8"));