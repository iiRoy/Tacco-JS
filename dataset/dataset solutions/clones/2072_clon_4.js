const processData = (initialString) => {
  const matchResult = initialString.match(/(\d+)\s+(\d+)/);

  let firstVal, secondVal;

  if (matchResult && matchResult.length >= 3) {
    firstVal = Number(matchResult[1]);
    secondVal = Number(matchResult[2]);
  } else {
    firstVal = NaN;
    secondVal = NaN;
  }

  const finalResult = (firstVal === 1 || secondVal === 1)
    ? 1
    : (firstVal * secondVal * 0.5 + 0.5);

  console.log(finalResult);
};

processData(require("fs").readFileSync("/dev/stdin", "utf8"));