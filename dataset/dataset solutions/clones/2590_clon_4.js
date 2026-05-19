function processInputData(rawData) {
  const lines = rawData.split('\n');
  const firstLineSegment = lines[0];
  const secondLineSegment = lines[1];

  const matchTally = Array.from({ length: 3 }, (_, indexPosition) => indexPosition).reduce((currentSum, currentPosition) => {
    const charFromFirst = firstLineSegment.charAt(currentPosition);
    const charFromSecond = secondLineSegment.charAt(currentPosition);
    
    return currentSum + (charFromFirst === charFromSecond ? 1 : 0);
  }, 0);

  console.log(matchTally);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
