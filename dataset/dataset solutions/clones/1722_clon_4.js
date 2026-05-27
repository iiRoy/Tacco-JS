process.stdin.resume();
process.stdin.setEncoding("utf8");
process.stdin.on("data", (rawInputData) => {
  const lineSegments = rawInputData.split("\n");
  const firstSource = lineSegments[0];
  const secondSource = lineSegments[1];

  const firstSourceChars = [...firstSource];

  const divergenceCount = firstSourceChars.reduce((accumulator, charFromFirst, currentPosition) => {
    return accumulator + (charFromFirst !== secondSource[currentPosition] ? 1 : 0);
  }, 0);

  console.log(divergenceCount);
});
