function solveProblem(rawInputString) {
  const numericStrings = rawInputString.split(" ");

  const [firstNum, secondNum, thirdNum] = numericStrings.map(Number);

  const rootOfFirst = Math.sqrt(firstNum);
  const rootOfSecond = Math.sqrt(secondNum);
  const rootOfThird = Math.sqrt(thirdNum);

  const sumOfTwoRoots = rootOfFirst + rootOfSecond;

  let comparisonResult;
  if (rootOfThird > sumOfTwoRoots) {
    comparisonResult = "Yes";
  } else {
    comparisonResult = "No";
  }

  console.log(comparisonResult);
}

solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
