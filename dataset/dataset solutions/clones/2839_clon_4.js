const processInput = (rawData) => {
  const [firstLineContent] = rawData.split('\n');
  const [firstVal, secondVal] = firstLineContent.split(' ');

  const numericFirst = Number(firstVal);
  const numericSecond = Number(secondVal);

  const resultValue = (1 - +(numericSecond === 1)) * (numericFirst - numericSecond);

  console.log(resultValue);
};

processInput(require("node:fs").readFileSync("/dev/stdin", "utf8"));
