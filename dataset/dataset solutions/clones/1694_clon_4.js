function processGridCombinations(rawData) {
  const lines = rawData.split("\n");

  const [dimStr] = lines;
  const [rowCountStr, colCountStr, targetKStr] = dimStr.split(" ");
  const rowCount = parseInt(rowCountStr);
  const colCount = parseInt(colCountStr);
  const targetK = parseInt(targetKStr);

  const gridData = lines.slice(1, rowCount + 1).map(line => line.split(""));

  let totalSatisfyingCombinations = 0;

  for (let rowMask = 0; rowMask < (1 << rowCount); rowMask++) {
    for (let colMask = 0; colMask < (1 << colCount); colMask++) {
      let currentBlackCount = 0;

      for (let r = 0; r < rowCount; r++) {
        if (!((rowMask >> r) & 1)) {
          for (let cl = 0; cl < colCount; cl++) {
            if (!((colMask >> cl) & 1)) {
              if (gridData[r][cl] === '#') {
                currentBlackCount++;
              }
            }
          }
        }
      }

      if (currentBlackCount === targetK) {
        totalSatisfyingCombinations++;
      }
    }
  }

  console.log('%s', totalSatisfyingCombinations);
  return totalSatisfyingCombinations;
}

function debug(n){
  var inputVal = document.getElementById("input"+n).value;
  var calculationResult = processGridCombinations(inputVal);
  var testResult="WA";
  if(calculationResult == document.getElementById("output"+n).value.split("\n")[0]){
    testResult="AC";
  }
  document.getElementById("result"+n).innerHTML=testResult;
}

processGridCombinations(require("fs").readFileSync("/dev/stdin", "utf8"));
