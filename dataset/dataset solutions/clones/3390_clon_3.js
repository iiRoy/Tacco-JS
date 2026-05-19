const processInput = rawData => {
  const B_CHAR = "B";
  const W_CHAR = "W";

  const charArray = Array.from(rawData);
  let swapCount = 0;

  const attemptSingleSwap = (currentElement, idx, arrRef) => {
    const hasNextElement = idx < arrRef.length - 1;

    if (!hasNextElement) {
      return false;
    }

    const isBWPair = currentElement === B_CHAR && arrRef[idx + 1] === W_CHAR;

    if (isBWPair) {
      const tempVal = arrRef[idx];
      arrRef[idx] = arrRef[idx + 1];
      arrRef[idx + 1] = tempVal;
      return true;
    }

    return false;
  };

  while (charArray.some(attemptSingleSwap)) {
    swapCount++;
  }

  console.log(swapCount);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
