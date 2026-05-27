let dataArray;

function processValues(idxOne, idxTwo) {
  if (dataArray[idxOne] % 2 === 1) {
    dataArray[idxOne]--;
  }
  dataArray[idxOne] /= 2;
  dataArray[idxTwo] += dataArray[idxOne];
}

function executeProgram(inputString) {
  let loopLimit = (dataArray = inputString.split("\n")[0].split(/\s/).map(function(strVal) {
    return Number(strVal);
  }))[2];

  for (let iterationCount = 1; iterationCount <= loopLimit; iterationCount++) {
    if (iterationCount % 2 === 1) {
      processValues(0, 1);
    } else {
      processValues(1, 0);
    }
  }

  console.log("%d %d", dataArray[0], dataArray[1]);
}

executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));
