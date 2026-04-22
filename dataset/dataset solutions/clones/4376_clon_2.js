const ComputeResult = (sourceText) => {
  let numberSequence = sourceText.trim()
                                 .split(' ')
                                 .map( (token) => parseInt(token, 10) );

  const calculatedValue = numberSequence[0] - numberSequence[1];
  console.log(calculatedValue);
};

ComputeResult(
  require("fs")
    .readFileSync("/dev/stdin", "utf8")
);