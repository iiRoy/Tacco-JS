'use strict'
function Main(input) {
  const inputArray = input.split('\n');
  const obj = {
    a: [...inputArray[0]],
    b: [...inputArray[1]],
    c: [...inputArray[2]]
  };

  let thisTime = 'a'
  let nextTime = '';
  let result = '';
  while (1) {
    nextTime = obj[nextTurn].shift();
    if (obj[thisTime].length == 0) {
      result = thisTime.toUpperCase();
      break;
    }
    thisTime = nextTime;
  }
  console.log(result);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));