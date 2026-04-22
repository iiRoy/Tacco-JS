class InputReader {
    #sourceLines;
    #lineCounter;
    #currentLineTokens;
    #tokenCounter;

    constructor(initialContent) {
        this.#sourceLines = initialContent.trim().split('\n');
        this.#lineCounter = 0;
        this.#currentLineTokens = [];
        this.#tokenCounter = 0;
    }

    // Equivalent to GET.a()
    retrieveItem(asString = false) {
        if (this.#tokenCounter >= this.#currentLineTokens.length) {
            if (this.#lineCounter >= this.#sourceLines.length) {
                return undefined;
            }
            this.#currentLineTokens = this.#sourceLines[this.#lineCounter++].split(' ').reverse();
            this.#tokenCounter = 0;
        }
        const itemValue = this.#currentLineTokens[this.#tokenCounter++];
        return asString ? itemValue : Number(itemValue);
    }

    // Equivalent to GET.l()
    readEntireLine(asString = false) {
        if (this.#lineCounter >= this.#sourceLines.length) {
            return undefined;
        }
        const lineContent = this.#sourceLines[this.#lineCounter++].split(' ');
        this.#tokenCounter = 0; // Reset token counter if a full line is read
        return asString ? lineContent : lineContent.map(Number);
    }

    // Equivalent to GET.m()
    readMatrix(rows, asString = false) {
        const resultMatrix = [];
        for (let i = 0; i < rows; i++) {
            resultMatrix.push(this.readEntireLine(asString));
        }
        return resultMatrix;
    }

    // Equivalent to GET.r()
    readVector(count, asString = false) {
        const resultVector = [];
        for (let i = 0; i < count; i++) {
            if (this.#lineCounter >= this.#sourceLines.length) {
                break;
            }
            const value = this.#sourceLines[this.#lineCounter++];
            resultVector.push(asString ? value : Number(value));
        }
        this.#tokenCounter = 0; // Reset token counter
        return resultVector;
    }
}

const obtainInput = (source) => new InputReader(source);

const createDisjointSet = (totalElements) => {
    const parentMap = Array.from({ length: totalElements }, (_, idx) => idx);
    const setSizes = Array(totalElements).fill(1);

    const findRoot = (element) => {
        if (parentMap[element] === element) {
            return element;
        }
        return parentMap[element] = findRoot(parentMap[element]);
    };

    const mergeSets = (elemA, elemB) => {
        let rootA = findRoot(elemA);
        let rootB = findRoot(elemB);

        if (rootA === rootB) {
            return false;
        }

        if (setSizes[rootA] < setSizes[rootB]) {
            [rootA, rootB] = [rootB, rootA];
        }
        parentMap[rootB] = rootA;
        setSizes[rootA] += setSizes[rootB];
        return true;
    };

    const getSetSize = (element) => {
        return setSizes[findRoot(element)];
    };

    return {
        getSetSize,
        mergeSets
    };
};

const createStringDigestor = (sourceText) => {
    const hashBase = 1019;
    const primeModuli = [1000000007, 1000000009];
    const textLen = sourceText.length;

    const precomputedData = primeModuli.map(mod => {
        const currentHashes = new Array(textLen + 1).fill(0);
        const currentPowers = new Array(textLen + 1).fill(1);

        for (let i = 0; i < textLen; i++) {
            currentPowers[i + 1] = (currentPowers[i] * hashBase) % mod;
            currentHashes[i + 1] = (currentHashes[i] * hashBase + sourceText.charCodeAt(i)) % mod;
        }
        return { hashes: currentHashes, powers: currentPowers, modulus: mod };
    });

    const calculateSubstringDigest = (startIndex, endIndex, modulusIndex) => {
        const { hashes, powers, modulus } = precomputedData[modulusIndex];
        let digestValue = (hashes[endIndex] - (hashes[startIndex] * powers[endIndex - startIndex]) % modulus + modulus) % modulus;
        return digestValue;
    };

    const computeStringSignature = (inputString) => {
        return primeModuli.map(mod => {
            let currentSignature = 0;
            for (let i = 0; i < inputString.length; i++) {
                currentSignature = (currentSignature * hashBase + inputString.charCodeAt(i)) % mod;
            }
            return currentSignature;
        });
    };

    const checkSubstringSignature = (expectedSignature, subLength, startIndex) => {
        for (let j = 0; j < primeModuli.length; j++) {
            const actualSignature = calculateSubstringDigest(startIndex, startIndex + subLength, j);
            if (actualSignature !== expectedSignature[j]) {
                return false;
            }
        }
        return true;
    };

    return {
        computeStringSignature,
        checkSubstringSignature,
    };
};

const processChallenge = () => {
    const inputHandler = obtainInput(require("fs").readFileSync("/dev/stdin", "utf8"));
    const primaryStr = inputHandler.retrieveItem(true);
    const secondaryStr = inputHandler.retrieveItem(true);

    const primaryLength = primaryStr.length;
    const secondaryLength = secondaryStr.length;

    let expandedPrimary = primaryStr + primaryStr;
    while (expandedPrimary.length < primaryLength + secondaryLength) {
        expandedPrimary += primaryStr;
    }

    const componentManager = createDisjointSet(primaryLength);
    const hashProcessor = createStringDigestor(expandedPrimary);
    const secondaryStrSignature = hashProcessor.computeStringSignature(secondaryStr);

    for (let currentIdx = 0; currentIdx < primaryLength; currentIdx++) {
        if (hashProcessor.checkSubstringSignature(secondaryStrSignature, secondaryLength, currentIdx)) {
            const nextIdx = (currentIdx + secondaryLength) % primaryLength;
            if (!componentManager.mergeSets(currentIdx, nextIdx)) {
                return -1;
            }
        }
    }

    let largestComponent = 0;
    for (let nodeIdx = 0; nodeIdx < primaryLength; nodeIdx++) {
        const sizeOfComponent = componentManager.getSetSize(nodeIdx);
        if (sizeOfComponent > largestComponent) {
            largestComponent = sizeOfComponent;
        }
    }
    return largestComponent - 1;
};

console.log(processChallenge());