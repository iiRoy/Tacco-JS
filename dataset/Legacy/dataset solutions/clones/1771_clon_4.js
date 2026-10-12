function ProcessInput(rawData) {
  const dataSegments = rawData.split(" ");
  const countA = Number(dataSegments[0]);
  const totalB = Number(dataSegments[1]);

  const parityCheck = (totalB % 2) === 0;
  const upperLimitCheck = (4 * countA) >= totalB;

  console.log(parityCheck && upperLimitCheck ? 'Yes' : 'No');
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
