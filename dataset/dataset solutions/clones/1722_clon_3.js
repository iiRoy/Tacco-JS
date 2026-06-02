process.stdin.resume();
process.stdin.setEncoding("utf8");
process.stdin.on("data", (inputBuffer) => {
  const inputLineSegments = inputBuffer.split("\n");
  const firstInputString = inputLineSegments[0];
  const secondInputString = inputLineSegments[1];

  const determineCharacterMismatches = (strOne, strTwo) => {
    let totalMismatchCount = 0;
    const commonStringLength = strOne.length;

    for (let charIndexPosition = 0; charIndexPosition < commonStringLength; charIndexPosition++) {
      const charFromFirst = strOne[charIndexPosition];
      const charFromSecond = strTwo[charIndexPosition];

      if (charFromFirst !== charFromSecond) {
        totalMismatchCount = totalMismatchCount + 1;
      }
    }
    return totalMismatchCount;
  };

  const finalMismatchResult = determineCharacterMismatches(firstInputString, secondInputString);
  console.log(finalMismatchResult);
});
