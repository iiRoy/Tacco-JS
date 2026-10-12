function processInput(dataString) {
  let digitSum = 0;
  for (const currentDigit of dataString) {
    digitSum += Number(currentDigit);
  }

  const resultPhrase = (digitSum % 9 === 0) ? "Yes" : "No";
  console.log(resultPhrase);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
