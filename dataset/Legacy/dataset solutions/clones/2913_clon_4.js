function ProcessInput(rawData) {
  const lineSegments = rawData.split("\n");
  lineSegments.pop();

  const configValues = lineSegments[0].split(" ");
  const totalItems = parseInt(configValues[0]);
  const maxOperations = parseInt(configValues[1]);

  const initialItemSet = lineSegments[1].split(" ").map(str => parseInt(str));

  let optimalTarget = 0;
  for (const itemValue of initialItemSet) {
    if (itemValue > 0) {
      optimalTarget += itemValue;
    }
  }

  let peakScore = 0;
  let haltTraversal = false;

  // State object: { r: remainingItems, h: heldItems, o: operationsDone, s: currentScore }
  // 'r' for remaining, 'h' for held, 'o' for operations, 's' for score
  const stateQueue = [];
  stateQueue.push({ r: [...initialItemSet], h: [], o: 0, s: 0 });

  while (stateQueue.length > 0 && !haltTraversal) {
    const currentContext = stateQueue.shift();

    if (currentContext.s > peakScore) {
      peakScore = currentContext.s;
      if (peakScore === optimalTarget) {
        haltTraversal = true;
        break;
      }
    }

    if (currentContext.o >= maxOperations) {
      continue;
    }

    // Operation 1: Take from front of remaining, add to held
    if (currentContext.r.length > 0) {
      const itemFromFront = currentContext.r[0];
      const nextRemainingFront = currentContext.r.slice(1);
      const nextHeldFront = [...currentContext.h, itemFromFront];
      const nextScoreFront = currentContext.s + itemFromFront;
      stateQueue.push({ r: nextRemainingFront, h: nextHeldFront, o: currentContext.o + 1, s: nextScoreFront });
    }

    // Operation 2: Take from back of remaining, add to held
    if (currentContext.r.length > 0) {
      const itemFromBack = currentContext.r[currentContext.r.length - 1];
      const nextRemainingBack = currentContext.r.slice(0, -1);
      const nextHeldBack = [...currentContext.h, itemFromBack];
      const nextScoreBack = currentContext.s + itemFromBack;
      stateQueue.push({ r: nextRemainingBack, h: nextHeldBack, o: currentContext.o + 1, s: nextScoreBack });
    }

    // Operations 3 and 4: Move from held to remaining
    for (let heldItemIndex = 0; heldItemIndex < currentContext.h.length; heldItemIndex++) {
      const itemToReturn = currentContext.h[heldItemIndex];
      const tempHeld = [...currentContext.h];
      tempHeld.splice(heldItemIndex, 1);

      const scoreAfterReturn = currentContext.s - itemToReturn;

      // Operation 3: Add to front of remaining
      const nextRemainingToFront = [itemToReturn, ...currentContext.r];
      stateQueue.push({ r: nextRemainingToFront, h: tempHeld, o: currentContext.o + 1, s: scoreAfterReturn });

      // Operation 4: Add to back of remaining
      const nextRemainingToBack = [...currentContext.r, itemToReturn];
      stateQueue.push({ r: nextRemainingToBack, h: tempHeld, o: currentContext.o + 1, s: scoreAfterReturn });
    }
  }

  console.log(peakScore);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
