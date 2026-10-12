function Main(input) {
  const gridLines = input.split("\n");
  const [heightStr, widthStr] = gridLines.shift().split(" ");
  const gridHeight = parseInt(heightStr);
  const gridWidth = parseInt(widthStr);

  const charGrid = gridLines.slice(0, gridHeight).map(line => line.split(""));

  const leftwardExtents = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(0));
  const rightwardExtents = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(0));
  const upwardExtents = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(0));
  const downwardExtents = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(0));

  for (let rIndex = 0; rIndex < gridHeight; rIndex++) {
    for (let cIndex = 0; cIndex < gridWidth; cIndex++) {
      if (charGrid[rIndex][cIndex] === '.') {
        leftwardExtents[rIndex][cIndex] = (cIndex > 0 ? leftwardExtents[rIndex][cIndex - 1] : 0) + 1;
      }
    }
  }

  for (let rIndex = 0; rIndex < gridHeight; rIndex++) {
    for (let cIndex = gridWidth - 1; cIndex >= 0; cIndex--) {
      if (charGrid[rIndex][cIndex] === '.') {
        rightwardExtents[rIndex][cIndex] = (cIndex < gridWidth - 1 ? rightwardExtents[rIndex][cIndex + 1] : 0) + 1;
      }
    }
  }

  for (let cIndex = 0; cIndex < gridWidth; cIndex++) {
    for (let rIndex = 0; rIndex < gridHeight; rIndex++) {
      if (charGrid[rIndex][cIndex] === '.') {
        upwardExtents[rIndex][cIndex] = (rIndex > 0 ? upwardExtents[rIndex - 1][cIndex] : 0) + 1;
      }
    }
  }

  for (let cIndex = 0; cIndex < gridWidth; cIndex++) {
    for (let rIndex = gridHeight - 1; rIndex >= 0; rIndex--) {
      if (charGrid[rIndex][cIndex] === '.') {
        downwardExtents[rIndex][cIndex] = (rIndex < gridHeight - 1 ? downwardExtents[rIndex + 1][cIndex] : 0) + 1;
      }
    }
  }

  let overallMax = 0;

  for (let rIndex = 0; rIndex < gridHeight; rIndex++) {
    for (let cIndex = 0; cIndex < gridWidth; cIndex++) {
      if (charGrid[rIndex][cIndex] === '.') {
        const currentCellContribution = leftwardExtents[rIndex][cIndex] + rightwardExtents[rIndex][cIndex] + upwardExtents[rIndex][cIndex] + downwardExtents[rIndex][cIndex] - 3;
        overallMax = Math.max(overallMax, currentCellContribution);
      }
    }
  }

  console.log('%s', overallMax);
  return overallMax;
}

function debug(n){
  var input = document.getElementById("input"+n).value;
  var ans=Main(input);
  var result="WA";
  if(ans==document.getElementById("output"+n).value.split("\n")[0]){
    result="AC";
  }
  document.getElementById("result"+n).innerHTML=result;
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
