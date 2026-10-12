const createInputReader = (function() {
  class InputReader {
    constructor(inputString) {
      this.inputLines = inputString.trim().split("\n");
      this.currentLineIndex = 0;
    }

    readToken(asString = false) {
      let lineContent = this.inputLines[this.currentLineIndex];
      if (typeof lineContent === "string") {
        this.inputLines[this.currentLineIndex] = lineContent.split(" ").reverse();
      }
      
      const tokens = this.inputLines[this.currentLineIndex];
      const tokenValue = tokens.pop();
      if (tokens.length === 0) {
        this.currentLineIndex++;
      }
      return asString ? tokenValue : Number(tokenValue);
    }

    readLineTokens(asStrings = false) {
      if (this.currentLineIndex >= this.inputLines.length) {
        return [];
      }
      const lineStr = this.inputLines[this.currentLineIndex++];
      const tokens = lineStr.split(" ");
      return asStrings ? tokens : tokens.map(Number);
    }

    readMatrix(numRows, asStrings = false) {
      const matrix = [];
      for (let i = 0; i < numRows; i++) {
        if (this.currentLineIndex >= this.inputLines.length) break;
        const lineStr = this.inputLines[this.currentLineIndex++];
        matrix.push(lineStr.split(" "));
      }
      return asStrings ? matrix : matrix.map(row => row.map(Number));
    }

    readLines(numRows, asStrings = false) {
      const lines = [];
      for (let i = 0; i < numRows; i++) {
        if (this.currentLineIndex >= this.inputLines.length) break;
        lines.push(this.inputLines[this.currentLineIndex++]);
      }
      return asStrings ? lines : lines.map(Number);
    }
  }
  return (inputString) => new InputReader(inputString);
})();

const inputReader = createInputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initialValue){
  const dimensions=arguments,len=dimensions.length;
  let arrayCreationString="Array(dimensions["+--len+"]).fill(0).map(x=>{return "+initialValue+";})";
  while(--len)arrayCreationString="Array(dimensions["+len+"]).fill(0).map(x=>"+arrayCreationString+")";
  return eval(arrayCreationString);
}

const createDisjointSetUnion = (function() {
  class DisjointSetUnion {
    constructor(numElements) {
      this.parentOrSize = Array(numElements + 1).fill(-1);
    }

    findSetRoot(elementIndex) {
      const parents = this.parentOrSize;
      if (parents[elementIndex] < 0) {
        return elementIndex;
      }
      return parents[elementIndex] = this.findSetRoot(parents[elementIndex]);
    }

    areInSameSet(elementX, elementY) {
      return this.findSetRoot(elementX) === this.findSetRoot(elementY);
    }

    unionSets(elementX, elementY) {
      let rootX = this.findSetRoot(elementX);
      let rootY = this.findSetRoot(elementY);

      if (rootX === rootY) {
        return false;
      }

      const parents = this.parentOrSize;

      if (rootX < rootY) {
        parents[rootX] += parents[rootY];
        parents[rootY] = rootX;
      } else {
        parents[rootY] += parents[rootX];
        parents[rootX] = rootY;
      }

      return true;
    }

    getSetSize(elementIndex) {
      return -this.parentOrSize[this.findSetRoot(elementIndex)];
    }
  }
  return (numElements) => new DisjointSetUnion(numElements);
})();

const createStringHasher = (function() {
  const DEFAULT_HASH_BASE = 1007;
  const DEFAULT_HASH_MODS = [94906249, 94906247];

  class StringHasher {
    constructor(inputString) {
      this._stringLength = inputString.length;
      this._prefixHashes = Array(DEFAULT_HASH_MODS.length).fill(0).map(() => [0]);
      this._basePowers = Array(DEFAULT_HASH_MODS.length).fill(0).map(() => [1]);

      for (let j = 0; j < DEFAULT_HASH_MODS.length; j++) {
        const currentMod = DEFAULT_HASH_MODS[j];
        const currentBasePowers = this._basePowers[j];
        const currentPrefixHashes = this._prefixHashes[j];

        currentBasePowers.length = this._stringLength + 1;
        currentPrefixHashes.length = this._stringLength + 1;

        for (let i = 0; i < this._stringLength; i++) {
          currentBasePowers[i + 1] = (currentBasePowers[i] * DEFAULT_HASH_BASE) % currentMod;
          currentPrefixHashes[i + 1] = (currentPrefixHashes[i] * DEFAULT_HASH_BASE + inputString.charCodeAt(i)) % currentMod;
        }
      }
    }

    _getRangeHash(startIndex, endIndex, modIndex) {
      const currentMod = DEFAULT_HASH_MODS[modIndex];
      const currentPrefixHashes = this._prefixHashes[modIndex];
      const currentBasePowers = this._basePowers[modIndex];

      let hashValue = (currentPrefixHashes[endIndex] - currentPrefixHashes[startIndex] * currentBasePowers[endIndex - startIndex]) % currentMod;
      return hashValue < 0 ? hashValue + currentMod : hashValue;
    }

    findPattern(patternString, startIndex = 0) {
      const patternHashValues = StringHasher.computeStringHash(patternString);
      const patternLength = patternString.length;
      const numMods = DEFAULT_HASH_MODS.length;
      const searchEndIndex = this._stringLength - patternLength + 1;

      for (let i = startIndex; i < searchEndIndex; i++) {
        if (this._getRangeHash(i, i + patternLength, 0) === patternHashValues[0]) {
          let matchCount = 1;
          for (let j = 1; j < numMods; j++) {
            if (this._getRangeHash(i, i + patternLength, j) !== patternHashValues[j]) {
              break;
            }
            matchCount++;
          }
          if (matchCount === numMods) {
            return i;
          }
        }
      }
      return -1;
    }

    verifyHashMatch(targetHashValues, targetLength, startIndex) {
      const numMods = DEFAULT_HASH_MODS.length;
      for (let j = 0; j < numMods; j++) {
        if (this._getRangeHash(startIndex, startIndex + targetLength, j) !== targetHashValues[j]) {
          return 0;
        }
      }
      return 1;
    }

    appendData(additionalString) {
      const oldLength = this._stringLength;
      this._stringLength += additionalString.length;

      for (let j = 0; j < DEFAULT_HASH_MODS.length; j++) {
        const currentMod = DEFAULT_HASH_MODS[j];
        const currentBasePowers = this._basePowers[j];
        const currentPrefixHashes = this._prefixHashes[j];

        currentBasePowers.length = this._stringLength + 1;
        currentPrefixHashes.length = this._stringLength + 1;

        for (let i = 0; i < additionalString.length; i++) {
          const charCode = additionalString.charCodeAt(i);
          currentBasePowers[oldLength + i + 1] = (currentBasePowers[oldLength + i] * DEFAULT_HASH_BASE) % currentMod;
          currentPrefixHashes[oldLength + i + 1] = (currentPrefixHashes[oldLength + i] * DEFAULT_HASH_BASE + charCode) % currentMod;
        }
      }
      return this._stringLength;
    }

    static computeStringHash(inputString) {
      const resultHashes = [];
      for (let j = 0; j < DEFAULT_HASH_MODS.length; j++) {
        const currentMod = DEFAULT_HASH_MODS[j];
        let currentHash = 0;
        for (let i = 0; i < inputString.length; i++) {
          currentHash = (currentHash * DEFAULT_HASH_BASE + inputString.charCodeAt(i)) % currentMod;
        }
        resultHashes.push(currentHash);
      }
      return resultHashes;
    }
  }
  return (inputString) => new StringHasher(inputString);
})();

console.log(processMainLogic());

function processMainLogic() {
  const sourceString = inputReader.readToken(true);
  const targetString = inputReader.readToken(true);

  const sourceLength = sourceString.length;
  const targetLength = targetString.length;

  let extendedSource = sourceString + sourceString;
  while (extendedSource.length < sourceLength + targetLength) {
    extendedSource += sourceString;
  }

  const dsuManager = createDisjointSetUnion(sourceLength);
  const sourceHasher = createStringHasher(extendedSource);
  const targetHashValues = createStringHasher.computeStringHash(targetString);

  for (let i = 0; i < sourceLength; i++) {
    if (sourceHasher.verifyHashMatch(targetHashValues, targetLength, i)) {
      if (!dsuManager.unionSets(i, (i + targetLength) % sourceLength)) {
        return -1;
      }
    }
  }

  let maxComponentSize = 0;
  for (let i = 0; i < sourceLength; i++) {
    const currentComponentSize = dsuManager.getSetSize(i);
    if (currentComponentSize > maxComponentSize) {
      maxComponentSize = currentComponentSize;
    }
  }
  
  return maxComponentSize - 1;
}
