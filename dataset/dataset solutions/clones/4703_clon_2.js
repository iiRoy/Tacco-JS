function ProcessInput (rawData) {
  let tokenizedData = rawData.split(' ');
  const sCount = Number(tokenizedData[0]);
  let cCount = Number(tokenizedData[1]);
  let finalScore = 0;

  // Calculate the maximum possible combinations based on S and C counts
  if (sCount > (cCount / 2)) {
    finalScore += Math.floor(cCount / 2);
  } else {
    finalScore += sCount;
    cCount -= finalScore * 2;
    finalScore += Math.floor(cCount / 4);
  }

  console.log(finalScore);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
