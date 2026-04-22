function ExecuteLogic(rawData) {
  rawData = rawData.split("\n");
  var patternString = rawData[1];
  var computedSequence;
  var foundSolution = false;
  ["S", "W"].forEach(firstChar => {
    ["S", "W"].forEach(secondChar => {
      computedSequence = new Array(patternString.length);
      computedSequence[0] = firstChar;
      computedSequence[1] = secondChar;
      for (
        var currentIdx = 2;
        currentIdx < patternString.length;
        currentIdx++
      ) {
        if (
          computedSequence[currentIdx - 1] === "W" ^
          patternString[currentIdx - 1] === "o"
        ) {
          computedSequence[currentIdx] = computedSequence[currentIdx - 2];
        } else {
          if (computedSequence[currentIdx - 2] === "W") {
            computedSequence[currentIdx] = "S";
          } else {
            computedSequence[currentIdx] = "W";
          }
        }
      }
      if (
        !foundSolution &&
        (
          computedSequence[0] === "S" ^
          patternString[0] === "o" ^
          computedSequence[computedSequence.length - 1] === computedSequence[1]
        ) &&
        (
          computedSequence[computedSequence.length - 1] === "S" ^
          patternString[computedSequence.length - 1] === "o" ^
          computedSequence[computedSequence.length - 2] === computedSequence[0]
        )
      ) {
        console.log(computedSequence.join(""));
        foundSolution = true;
      }
    });
  });
  if (!foundSolution) console.log(-1);
}
// The following lines are for handling standard input/output and should not be modified.
ExecuteLogic(require("fs").readFileSync("/dev/stdin", "utf8"));