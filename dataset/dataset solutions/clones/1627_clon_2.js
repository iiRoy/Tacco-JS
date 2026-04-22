function ProcessInput(initialValue) {
  let divisorTarget = initialValue;
  let currentSum = 0;
  let finalIndex = undefined;

  for (let outerCounter = 0; outerCounter <= initialValue; outerCounter++) {
    currentSum = currentSum + (7 * Math.pow(10, outerCounter));
    if (currentSum <= initialValue) {
      continue;
    }
    if (finalIndex) {
      break;
    }
    for (let innerMultiplier = 1; innerMultiplier * divisorTarget <= currentSum; innerMultiplier++) {
      const productValue = divisorTarget * innerMultiplier;
      if (productValue === currentSum) {
        finalIndex = outerCounter + 1;
        break;
      }
    }
  }

  if (finalIndex) {
    console.log(finalIndex);
  } else {
    console.log('-1');
  }
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));