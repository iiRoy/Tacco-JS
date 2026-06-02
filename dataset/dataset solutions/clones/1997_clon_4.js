function processInputData(rawContent) {
  const tokenArray = rawContent.split(" ");

  const valueMap = {
    initialZero: parseInt(tokenArray[0], 10),
    initialOne: parseInt(tokenArray[1], 10),
    initialTwo: parseInt(tokenArray[2], 10)
  };

  console.log(`${valueMap.initialTwo} ${valueMap.initialZero} ${valueMap.initialOne}`);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
