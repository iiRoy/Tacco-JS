outputLog=console.log;
inputLines=require("fs").readFileSync("/dev/stdin","utf-8").split("\n");
inputLines.length--;

(function (){
  var currentBalance = 0;
  for (var lineIndex = 1; lineIndex < inputLines.length; ++lineIndex) {
    amountValue = +inputLines[lineIndex].split(" ")[1];
    if (inputLines[lineIndex][0] == "(") {
      currentBalance += amountValue;
    } else {
      currentBalance -= amountValue;
    }
    if (currentBalance < 0) {
      outputLog("NO");
      return;
    }
  }
  outputLog("YES");
  return;
})();
