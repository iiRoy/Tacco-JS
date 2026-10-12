function ProcessInput(rawData) {
  let textRows = rawData.split('\n');
  let totalSum = 0;
  for (let idx in textRows) {
    if (textRows[idx] === "\n") {
      break;
    }
    totalSum += parseInt(textRows[idx]);
  }
  console.log(totalSum);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
