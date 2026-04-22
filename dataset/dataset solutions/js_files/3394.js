"use strict";
function is2n(num) {
  let numStr = num.toString(2);

  if (numStr[0] !== "1") {
    return false;
  }

  for (let i = 1; i < numStr.length; i++) {
    if (numStr[i] !== "0") {
      return false;
    }
  }
  return true;
}

function main(input) {
  const inputs = input.split("\n").filter(x => x !== "");

  const A = inputs[1].split(" ").map(Number);

  let sortedA = A.sort((a, b) => b - a);

  let count = 0;
  while (sortedA.length > 0) {
    // console.log({ sortedA });
    // console.log("i", sortedA[0]);
    let hasPair = false;
    for (let i = 1; i < sortedA.length; i++) {
      let sum = sortedA[0] + sortedA[i];
      if (is2n(sum)) {
        // console.log("j", sortedA[i]);
        sortedA.splice(i, 1);
        sortedA.splice(0, 1);
        count += 1;
        hasPair = true;
        break;
      }
    }

    if (!hasPair) {
      sortedA.splice(0, 1);
    }
  }

  console.log(count);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
