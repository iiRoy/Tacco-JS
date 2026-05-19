class InputProcessor {
    #lineData;
    #linePointer;

    constructor(rawText) {
        this.#lineData = rawText.trim().split('\n');
        this.#linePointer = 0;
    }

    extractToken(asString = false) {
        if (this.#linePointer >= this.#lineData.length) {
            return undefined;
        }

        let currentLine = this.#lineData[this.#linePointer];
        if (typeof currentLine === 'string') {
            this.#lineData[this.#linePointer] = currentLine.split(' ').reverse();
            currentLine = this.#lineData[this.#linePointer];
        }

        const token = currentLine.pop();
        if (currentLine.length === 0) {
            this.#linePointer++;
        }
        return asString ? token : Number(token);
    }

    extractLine(asStrings = false) {
        if (this.#linePointer >= this.#lineData.length) {
            return [];
        }
        const lineContent = this.#lineData[this.#linePointer];
        this.#linePointer++;
        const parts = lineContent.split(' ');
        return asStrings ? parts : parts.map(Number);
    }

    extractMatrix(numRows, asStrings = false) {
        const result = [];
        for (let i = 0; i < numRows; i++) {
            result.push(this.extractLine(asStrings));
        }
        return result;
    }

    extractRows(numRows, asStrings = false) {
        const result = [];
        for (let i = 0; i < numRows; i++) {
            if (this.#linePointer >= this.#lineData.length) {
                break;
            }
            const lineContent = this.#lineData[this.#linePointer];
            this.#linePointer++;
            result.push(asStrings ? lineContent : Number(lineContent));
        }
        return result;
    }
}

const createInputProcessor = (inputString) => new InputProcessor(inputString);

function createMultiDimArray(initialValue, ...dimensions) {
    const buildArray = (dimIndex) => {
        if (dimIndex === dimensions.length - 1) {
            return Array(dimensions[dimIndex]).fill(initialValue);
        } else {
            return Array(dimensions[dimIndex]).fill(0).map(() => buildArray(dimIndex + 1));
        }
    };
    return buildArray(0);
}

class DisjointSet {
    #parentMap;

    constructor(elementCount) {
        this.#parentMap = new Map();
        for (let i = 1; i <= elementCount; i++) {
            this.#parentMap.set(i, -1);
        }
    }

    findRepresentative(element) {
        let currentParent = this.#parentMap.get(element);
        if (currentParent === undefined) {
            return element;
        }
        if (currentParent < 0) {
            return element;
        }
        const root = this.findRepresentative(currentParent);
        this.#parentMap.set(element, root);
        return root;
    }

    areConnected(elementX, elementY) {
        return this.findRepresentative(elementX) === this.findRepresentative(elementY);
    }

    uniteSets(elementX, elementY) {
        let rootX = this.findRepresentative(elementX);
        let rootY = this.findRepresentative(elementY);

        if (rootX === rootY) {
            return false;
        }

        let sizeX = -this.#parentMap.get(rootX);
        let sizeY = -this.#parentMap.get(rootY);

        if (rootX < rootY) {
            this.#parentMap.set(rootX, -(sizeX + sizeY));
            this.#parentMap.set(rootY, rootX);
        } else {
            this.#parentMap.set(rootY, -(sizeX + sizeY));
            this.#parentMap.set(rootX, rootY);
        }
        return true;
    }

    getSetSize(element) {
        const root = this.findRepresentative(element);
        const size = this.#parentMap.get(root);
        return size !== undefined ? -size : 0;
    }
}

const createDisjointSet = (count) => new DisjointSet(count);

class StringHasher {
    #hashBase;
    #hashModuli;
    #powerTable;
    #prefixHashes;
    #currentStringLength;

    constructor(initialString) {
        this.#hashBase = 31;
        this.#hashModuli = [1000000007, 1000000009];

        this.#currentStringLength = initialString.length;
        this.#powerTable = Array.from({ length: this.#hashModuli.length }, () => [1]);
        this.#prefixHashes = Array.from({ length: this.#hashModuli.length }, () => [0]);

        this.#initializeHashes(initialString, 0);
    }

    #initializeHashes(str, startIndex) {
        for (let mIdx = 0; mIdx < this.#hashModuli.length; mIdx++) {
            const currentMod = this.#hashModuli[mIdx];
            const currentPowerTable = this.#powerTable[mIdx];
            const currentPrefixHashes = this.#prefixHashes[mIdx];

            for (let i = 0; i < str.length; i++) {
                const charCode = str.charCodeAt(i);
                const currentIdx = startIndex + i;

                currentPowerTable[currentIdx + 1] = (currentPowerTable[currentIdx] * this.#hashBase) % currentMod;
                currentPrefixHashes[currentIdx + 1] = (currentPrefixHashes[currentIdx] * this.#hashBase + charCode) % currentMod;
            }
        }
    }

    #getSubstringHash(startIdx, endIdx, modIndex) {
        const currentMod = this.#hashModuli[modIndex];
        const currentPrefixHashes = this.#prefixHashes[modIndex];
        const currentPowerTable = this.#powerTable[modIndex];

        let val = (currentPrefixHashes[endIdx] - (currentPrefixHashes[startIdx] * currentPowerTable[endIdx - startIdx]) % currentMod + currentMod) % currentMod;
        return val;
    }

    static computeStringHash(targetString) {
        const base = 31;
        const moduli = [1000000007, 1000000009];

        return moduli.map(mod => {
            let currentHash = 0;
            for (let i = 0; i < targetString.length; i++) {
                currentHash = (currentHash * base + targetString.charCodeAt(i)) % mod;
            }
            return currentHash;
        });
    }

    verifySubstringHash(targetHashArray, subLength, startPosition) {
        for (let mIdx = 0; mIdx < this.#hashModuli.length; mIdx++) {
            if (this.#getSubstringHash(startPosition, startPosition + subLength, mIdx) !== targetHashArray[mIdx]) {
                return false;
            }
        }
        return true;
    }

    appendString(newSegment) {
        const oldLength = this.#currentStringLength;
        this.#currentStringLength += newSegment.length;

        for (let mIdx = 0; mIdx < this.#hashModuli.length; mIdx++) {
            this.#powerTable[mIdx].length = this.#currentStringLength + 1;
            this.#prefixHashes[mIdx].length = this.#currentStringLength + 1;
        }

        this.#initializeHashes(newSegment, oldLength);
        return this.#currentStringLength;
    }
}

const createStringHasher = (str) => new StringHasher(str);

function processStrings() {
    const inputReader = createInputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

    const sourceString = inputReader.extractToken(true);
    const targetPattern = inputReader.extractToken(true);

    const sourceLength = sourceString.length;
    const patternLength = targetPattern.length;

    let extendedSource = sourceString;
    while (extendedSource.length < sourceLength + patternLength) {
        extendedSource += sourceString;
    }

    const dsu = createDisjointSet(sourceLength);
    const stringHashCalculator = createStringHasher(extendedSource);
    const patternHash = StringHasher.computeStringHash(targetPattern);

    Array.from({ length: sourceLength }, (_, index) => index).forEach(idx => {
        if (stringHashCalculator.verifySubstringHash(patternHash, patternLength, idx)) {
            dsu.uniteSets(idx + 1, (idx + patternLength) % sourceLength + 1);
        }
    });

    let maxComponentSize = 0;
    Array.from({ length: sourceLength }, (_, index) => index).forEach(idx => {
        const currentComponentSize = dsu.getSetSize(idx + 1);
        if (currentComponentSize > maxComponentSize) {
            maxComponentSize = currentComponentSize;
        }
    });

    return maxComponentSize - 1;
}

console.log(processStrings());
