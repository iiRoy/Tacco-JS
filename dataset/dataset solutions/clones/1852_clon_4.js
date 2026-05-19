function Main(inputContent) {
  const [numericConstraint, targetString] = inputContent.split('\n');
  const charLimit = Number(numericConstraint);

  const resultString = targetString.length <= charLimit
    ? targetString
    : targetString.match(new RegExp(`^.{0,${charLimit}}`))[0] + '...';

  console.log(resultString);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
