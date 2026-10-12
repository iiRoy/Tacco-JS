process.stdin.resume();
process.stdin.setEncoding("utf-8");

process.stdin.on("data", function(inputChunk) {
  const inputValues = inputChunk.trim().split(" ");
  const firstValue = inputValues[0];
  const secondValue = inputValues[1];
  const thirdValue = inputValues[2];

  const distinctSet = new Set([firstValue, secondValue, thirdValue]);
  const uniqueCount = distinctSet.size;

  let outputResult;
  switch (uniqueCount) {
    case 1:
      outputResult = "1";
      break;
    case 2:
      outputResult = "2";
      break;
    case 3:
      outputResult = "3";
      break;
  }

  process.stdout.write(outputResult);
});
