function processInput(  rawData  ) {
  let quantity = Number(rawData.split(" \n ")[0]);
  let firstList = rawData.split('\n')[1].split(' ').map((numStr) => Number(numStr));
  let secondList = rawData.split("\n")[2].split(" ").map((numStr) => parseInt(numStr, 10));

  let resultArray = [ ];
  let remainingB = [ ];

  for ( let  idx = 0 ;  idx < quantity + 1 ;  idx++ ) {
    if (idx === 0) {
      if (firstList[idx] >= secondList[idx]) {
        resultArray[idx] = secondList[idx];
        remainingB[idx] = 0;
      } else {
        resultArray[idx] = firstList[idx];
        remainingB[idx] = secondList[idx] - firstList[idx];
      }
    } else {
      if (firstList[idx] - remainingB[idx - 1] >= secondList[idx]) {
        resultArray[idx] = remainingB[idx - 1] + secondList[idx];
        remainingB[idx] = 0;
      } else {
        resultArray[idx] = firstList[idx];
        remainingB[idx] = secondList[idx] - (firstList[idx] - remainingB[idx - 1]);
      }
    }
  }

  const calculateTotal = function(inputArray) {
    let currentTotal = 0;
    for (let itemIndex = 0; itemIndex < inputArray.length; itemIndex++) {
      currentTotal += inputArray[itemIndex];
    }
    return currentTotal;
  };
  console.log(calculateTotal(resultArray));
}
processInput( require('fs').readFileSync('/dev/fd/0', 'utf-8') );