// This function processes the entire collection of provided data.
function ProcessInput(dataSet) {
  let startVal = dataSet[0].split(' ')[0] - 0;
  let endVal = dataSet[0].split(' ')[1] - 0;

  let resultCount = 0;

  for (let currentNum = startVal; currentNum <= endVal; currentNum++) {
    const numStrArr = currentNum.toString().split('');
    if (numStrArr.join('') === numStrArr.reverse().join('')) {
      resultCount++;
    }
  }

  console.log(resultCount);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));