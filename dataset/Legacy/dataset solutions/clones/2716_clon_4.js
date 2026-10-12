const inputReader = (() => {
    class InputProcessor {
        constructor(rawContent) {
            this.lines = rawContent.trim().split("\n");
            this.lineCursor = 0;
            this.currentLineFragments = [];
        }

        _ensureFragments() {
            if (this.currentLineFragments.length === 0 && this.lineCursor < this.lines.length) {
                this.currentLineFragments = this.lines[this.lineCursor++].split(" ");
            }
        }

        extractFragment(convertToNumber) {
            this._ensureFragments();
            if (this.currentLineFragments.length === 0) return undefined;
            const fragment = this.currentLineFragments.shift();
            return convertToNumber ? +fragment : fragment;
        }

        extractLine(convertToNumbers) {
            if (this.lineCursor >= this.lines.length) return undefined;
            const lineContent = this.lines[this.lineCursor++].split(" ");
            return convertToNumbers ? lineContent.map(Number) : lineContent;
        }

        extractMatrix(rowCount, convertToNumbers) {
            if (this.lineCursor + rowCount > this.lines.length) return undefined;
            const segment = this.lines.slice(this.lineCursor, this.lineCursor + rowCount);
            this.lineCursor += rowCount;
            return convertToNumbers ? segment.map(l => l.split(" ").map(Number)) : segment.map(l => l.split(" "));
        }

        extractVector(count, convertToNumbers) {
            if (this.lineCursor + count > this.lines.length) return undefined;
            const segment = this.lines.slice(this.lineCursor, this.lineCursor + count);
            this.lineCursor += count;
            return convertToNumbers ? segment.map(Number) : segment;
        }
    }

    return (content) => new InputProcessor(content);
})();
const processInput = inputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

function generateMultiArray(fillValue, ...dimensions) {
    const recursiveBuilder = (dims) => {
        if (dims.length === 0) {
            return fillValue;
        }
        const currentSize = dims[0];
        const remainingDims = dims.slice(1);
        return Array.from({ length: currentSize }, () => recursiveBuilder(remainingDims));
    };
    return recursiveBuilder(dimensions);
}

const StringHasher = (() => {
    const PRIMES = [1009, 1007];
    const MODULI = [1000000007, 1000000009];

    class Hasher {
        constructor(initialString) {
            this.currentLength = initialString.length;
            this.powerCache = Array.from({ length: MODULI.length }, () => []);
            this.hashPrefixes = Array.from({ length: MODULI.length }, () => []);

            for (let j = 0; j < MODULI.length; j++) {
                this.powerCache[j][0] = 1;
                this.hashPrefixes[j][0] = 0;
                for (let i = 0; i < this.currentLength; i++) {
                    this.powerCache[j][i + 1] = Hasher.modMul(this.powerCache[j][i], PRIMES[j], MODULI[j]);
                    let currentHash = Hasher.modMul(this.hashPrefixes[j][i], PRIMES[j], MODULI[j]) + initialString.charCodeAt(i);
                    this.hashPrefixes[j][i + 1] = currentHash % MODULI[j];
                }
            }
        }

        static modMul(val1, val2, modulus) {
            return Number((BigInt(val1) * BigInt(val2)) % BigInt(modulus));
        }

        static calculateStringHash(targetString) {
            const results = [];
            for (let j = 0; j < MODULI.length; j++) {
                let currentHash = 0;
                for (let i = 0; i < targetString.length; i++) {
                    currentHash = Hasher.modMul(currentHash, PRIMES[j], MODULI[j]) + targetString.charCodeAt(i);
                    currentHash %= MODULI[j];
                }
                results.push(currentHash);
            }
            return results;
        }

        getSubstringHash(startIndex, endIndex, modulusIndex) {
            let segmentHash = this.hashPrefixes[modulusIndex][endIndex] -
                              Hasher.modMul(this.hashPrefixes[modulusIndex][startIndex],
                                            this.powerCache[modulusIndex][endIndex - startIndex],
                                            MODULI[modulusIndex]);
            if (segmentHash < 0) {
                segmentHash += MODULI[modulusIndex];
            }
            return segmentHash;
        }

        locateSubstring(targetString, searchStart = 0) {
            const targetHashes = Hasher.calculateStringHash(targetString);
            const targetLength = targetString.length;
            const maxSearchIndex = this.currentLength - targetLength;

            for (let i = searchStart; i <= maxSearchIndex; i++) {
                let matchCount = 0;
                for (let j = 0; j < MODULI.length; j++) {
                    const currentSegmentHash = this.getSubstringHash(i, i + targetLength, j);
                    if (currentSegmentHash === targetHashes[j]) {
                        matchCount++;
                    } else {
                        break;
                    }
                }
                if (matchCount === MODULI.length) {
                    return i;
                }
            }
            return -1;
        }

        appendString(additionalContent) {
            const oldLength = this.currentLength;
            this.currentLength += additionalContent.length;

            for (let j = 0; j < MODULI.length; j++) {
                const newPowerCache = Array.from({ length: this.currentLength + 1 });
                const newHashPrefixes = Array.from({ length: this.currentLength + 1 });

                for(let k=0; k <= oldLength; k++) {
                    newPowerCache[k] = this.powerCache[j][k];
                    newHashPrefixes[k] = this.hashPrefixes[j][k];
                }

                for (let i = oldLength; i < this.currentLength; i++) {
                    newPowerCache[i + 1] = Hasher.modMul(newPowerCache[i], PRIMES[j], MODULI[j]);
                    let currentHash = Hasher.modMul(newHashPrefixes[i], PRIMES[j], MODULI[j]) + additionalContent.charCodeAt(i - oldLength);
                    newHashPrefixes[i + 1] = currentHash % MODULI[j];
                }
                this.powerCache[j] = newPowerCache;
                this.hashPrefixes[j] = newHashPrefixes;
            }
            return this.currentLength;
        }
    }
    return Hasher;
})();

console.log(mainLogic());
function mainLogic(){
  const sourceString = processInput.extractFragment(false);
  const targetPattern = processInput.extractFragment(false);

  let extendedSource = sourceString;
  while(extendedSource.length < targetPattern.length) {
      extendedSource += sourceString;
  }

  const combinedSource = extendedSource.concat(extendedSource);
  const hasherInstance = new StringHasher(combinedSource);

  let firstMatchIndex = hasherInstance.locateSubstring(targetPattern);
  if(firstMatchIndex === -1) return 0;

  let currentTargetPattern = targetPattern;
  let lastMatchPosition = firstMatchIndex;
  let occurrenceCount = 0;

  while(firstMatchIndex !== -1){
    currentTargetPattern = currentTargetPattern.concat(targetPattern);
    occurrenceCount++;
    lastMatchPosition = firstMatchIndex;
    firstMatchIndex = hasherInstance.locateSubstring(currentTargetPattern, firstMatchIndex);
  }

  hasherInstance.appendString(extendedSource);
  if(hasherInstance.locateSubstring(currentTargetPattern, lastMatchPosition) >= 0) return -1;
  return occurrenceCount;
}
