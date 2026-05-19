function processInput(rawInput) {
  const inputLines = rawInput.split("\n");
  inputLines.pop();
  const params = inputLines[0].split(" ");
  const itemCount = parseInt(params[0]);
  const maxOperations = parseInt(params[1]);
  const initialItems = inputLines[1].split(" ").map(valStr => parseInt(valStr));

  const initialState = {
    rem: initialItems.slice(),
    hld: [],
    ops: 0,
    s: 0
  };

  let overallMaximum = 0;
  const stateQueue = [initialState];

  let queueHeadIndex = 0;

  while (queueHeadIndex < stateQueue.length) {
    const currentProcess = stateQueue[queueHeadIndex++];

    overallMaximum = Math.max(overallMaximum, currentProcess.s);

    if (currentProcess.ops >= maxOperations) {
      continue;
    }

    const nextOperationCount = currentProcess.ops + 1;

    if (currentProcess.rem.length > 0) {
      const itemFromFront = currentProcess.rem[0];
      const nextRemFront = currentProcess.rem.slice(1);
      const nextHldFront = currentProcess.hld.concat(itemFromFront);
      const nextSumFront = currentProcess.s + itemFromFront;
      stateQueue.push({
        rem: nextRemFront,
        hld: nextHldFront,
        ops: nextOperationCount,
        s: nextSumFront
      });
    }

    if (currentProcess.rem.length > 0) {
      const itemFromBack = currentProcess.rem[currentProcess.rem.length - 1];
      const nextRemBack = currentProcess.rem.slice(0, -1);
      const nextHldBack = currentProcess.hld.concat(itemFromBack);
      const nextSumBack = currentProcess.s + itemFromBack;
      stateQueue.push({
        rem: nextRemBack,
        hld: nextHldBack,
        ops: nextOperationCount,
        s: nextSumBack
      });
    }

    for (let i = 0; i < currentProcess.hld.length; i++) {
      const itemToReturn = currentProcess.hld[i];
      const nextHldReduced = currentProcess.hld.filter((_, idx) => idx !== i);

      const nextSumReduced = currentProcess.s - itemToReturn;

      const nextRemReturnFront = [itemToReturn].concat(currentProcess.rem);
      stateQueue.push({
        rem: nextRemReturnFront,
        hld: nextHldReduced,
        ops: nextOperationCount,
        s: nextSumReduced
      });

      const nextRemReturnBack = currentProcess.rem.concat(itemToReturn);
      stateQueue.push({
        rem: nextRemReturnBack,
        hld: nextHldReduced,
        ops: nextOperationCount,
        s: nextSumReduced
      });
    }
  }

  console.log(overallMaximum);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
