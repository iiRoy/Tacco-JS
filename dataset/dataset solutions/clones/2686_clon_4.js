function programEntry(incomingData) {
  const initialSequence = incomingData;
  const processedParts = [];

  let lastIndex = 0;
  let currentSplitIndex;
  while ((currentSplitIndex = initialSequence.indexOf("LR", lastIndex)) !== -1) {
    processedParts.push(initialSequence.substring(lastIndex, currentSplitIndex));
    lastIndex = currentSplitIndex + 2;
  }
  processedParts.push(initialSequence.substring(lastIndex));

  const transformedParts = processedParts.map(part => "R" + part + "L");

  const totalPartsCount = transformedParts.length;
  if (totalPartsCount > 0) {
    transformedParts[0] = transformedParts[0].substring(1);
    transformedParts[totalPartsCount - 1] = transformedParts[totalPartsCount - 1].substring(0, transformedParts[totalPartsCount - 1].length - 1);
  }

  const calculateDistribution = (rightCount, leftCount, totalLength) => {
    if (totalLength % 2 === 0) {
      return [totalLength / 2, totalLength / 2];
    } else {
      const factorA = (rightCount > leftCount) ? 0 : 1;
      const factorB = (Math.min(rightCount, leftCount) % 2 === 0) ? 0 : 1;
      const factorC = factorA ^ factorB;
      if (factorC === 0) {
        return [(totalLength + 1) / 2, (totalLength - 1) / 2];
      } else {
        return [(totalLength - 1) / 2, (totalLength + 1) / 2];
      }
    }
  };

  const resultsCollection = transformedParts.reduce((accumulator, currentPart) => {
    const partLength = currentPart.length;
    let rlBoundaryRIndex = -1;

    for (let idx = 1; idx < partLength; idx++) {
      if (currentPart[idx - 1] === 'R' && currentPart[idx] === 'L') {
        rlBoundaryRIndex = idx - 1;
        break;
      }
    }

    if (rlBoundaryRIndex !== -1) {
      for (let idx = 0; idx < rlBoundaryRIndex; idx++) {
        accumulator.push(0);
      }
      const rightwardCount = rlBoundaryRIndex + 1;
      const leftwardCount = partLength - (rlBoundaryRIndex + 1);
      const [valForR, valForL] = calculateDistribution(rightwardCount, leftwardCount, partLength);
      accumulator.push(valForR);
      accumulator.push(valForL);
      for (let idx = rlBoundaryRIndex + 2; idx < partLength; idx++) {
        accumulator.push(0);
      }
    } else {
      for (let idx = 0; idx < partLength; idx++) {
        accumulator.push(0);
      }
    }
    return accumulator;
  }, []);

  console.log(resultsCollection.join(" "));
}

programEntry(require("fs").readFileSync("/dev/stdin", "utf8"));