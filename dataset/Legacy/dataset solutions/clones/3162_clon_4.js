const parseNumericSequence = (inputLine) => {
  return (typeof inputLine === 'string' ? inputLine.split(/\s+/) : inputLine)
    .map(Number);
};

class BigUnsigned {
  static BASE_VAL = 10000;
  static DIGIT_COUNT = 4;

  constructor(initialValue = 0) {
    this.parts = [];
    if (initialValue === 0) {
      this.parts.push(0);
      return;
    }

    let tempVal = initialValue;
    while (tempVal > 0) {
      this.parts.push(tempVal % BigUnsigned.BASE_VAL);
      tempVal = Math.floor(tempVal / BigUnsigned.BASE_VAL);
    }
  }

  sum(otherNum) {
    const resultParts = [];
    let carryOver = 0;
    const maxLength = Math.max(this.parts.length, otherNum.parts.length);

    for (let i = 0; i < maxLength || carryOver > 0; i++) {
      const partA = this.parts[i] || 0;
      const partB = otherNum.parts[i] || 0;
      const currentSum = partA + partB + carryOver;
      resultParts.push(currentSum % BigUnsigned.BASE_VAL);
      carryOver = Math.floor(currentSum / BigUnsigned.BASE_VAL);
    }

    const newBig = new BigUnsigned();
    newBig.parts = resultParts;
    return newBig;
  }

  product(otherNum) {
    const resParts = [0];
    const myParts = this.parts;
    const otherParts = otherNum.parts;

    for (let i = 0; i < myParts.length; i++) {
      for (let j = 0; j < otherParts.length; j++) {
        const productTerm = myParts[i] * otherParts[j];
        let currentIdx = i + j;
        let valToPropagate = productTerm;

        while (resParts.length <= currentIdx) {
          resParts.push(0);
        }

        while (valToPropagate > 0) {
          const existingVal = resParts[currentIdx];
          const sumWithPropagate = existingVal + valToPropagate;
          resParts[currentIdx] = sumWithPropagate % BigUnsigned.BASE_VAL;
          valToPropagate = Math.floor(sumWithPropagate / BigUnsigned.BASE_VAL);
          currentIdx++;
          if (valToPropagate > 0 && resParts.length <= currentIdx) {
            resParts.push(0);
          }
        }
      }
    }

    while (resParts.length > 1 && resParts[resParts.length - 1] === 0) {
      resParts.pop();
    }

    const newBig = new BigUnsigned();
    newBig.parts = resParts;
    return newBig;
  }

  asString() {
    if (this.parts.length === 0 || (this.parts.length === 1 && this.parts[0] === 0)) {
      return "0";
    }

    let firstNonZeroIdx = this.parts.length - 1;
    while (firstNonZeroIdx > 0 && this.parts[firstNonZeroIdx] === 0) {
      firstNonZeroIdx--;
    }

    let stringRepresentation = String(this.parts[firstNonZeroIdx]);

    for (let i = firstNonZeroIdx - 1; i >= 0; i--) {
      let partStr = String(this.parts[i]);
      while (partStr.length < BigUnsigned.DIGIT_COUNT) {
        partStr = "0" + partStr;
      }
      stringRepresentation += partStr;
    }
    return stringRepresentation;
  }
}

class DisjointSet {
  constructor(elementCount) {
    this.parentArray = Array.from({ length: elementCount }, (_, i) => i);
    this.sizeArray = Array(elementCount).fill(1);
  }

  findRepresentative(idx) {
    if (this.parentArray[idx] === idx) {
      return idx;
    }
    this.parentArray[idx] = this.findRepresentative(this.parentArray[idx]);
    return this.parentArray[idx];
  }

  uniteSets(idx1, idx2) {
    let root1 = this.findRepresentative(idx1);
    let root2 = this.findRepresentative(idx2);

    if (root1 !== root2) {
      if (this.sizeArray[root1] < this.sizeArray[root2]) {
        [root1, root2] = [root2, root1];
      }
      this.parentArray[root2] = root1;
      this.sizeArray[root1] += this.sizeArray[root2];
      return root1;
    }
    return root1;
  }

  getSetSize(idx) {
    return this.sizeArray[this.findRepresentative(idx)];
  }
}

(function (inputData) {
  const inputLines = inputData.split("\n");

  const [islandCount, bridgeCount] = parseNumericSequence(inputLines[0]);

  const bridgeConnections = inputLines.slice(1, bridgeCount + 1).map((line) => {
    const [fromIsland, toIsland] = parseNumericSequence(line);
    return [fromIsland, toIsland];
  });

  const incompatibilityCounts = [];
  const islandSets = new DisjointSet(islandCount);
  let connectedPairs = 0;

  for (let k = bridgeConnections.length - 1; k >= 0; k--) {
    const [islandA, islandB] = bridgeConnections[k];

    incompatibilityCounts.unshift(connectedPairs);

    const rootA = islandSets.findRepresentative(islandA - 1);
    const rootB = islandSets.findRepresentative(islandB - 1);

    if (rootA !== rootB) {
      const sizeA = islandSets.getSetSize(islandA - 1);
      const sizeB = islandSets.getSetSize(islandB - 1);
      connectedPairs += sizeA * sizeB;
      islandSets.uniteSets(islandA - 1, islandB - 1);
    }
  }

  const totalPossiblePairs = (islandCount * (islandCount - 1)) / 2;

  incompatibilityCounts.forEach((currentConnectedPairs) => {
    console.log(totalPossiblePairs - currentConnectedPairs);
  });

})(require("fs").readFileSync("/dev/stdin", "utf8"));
