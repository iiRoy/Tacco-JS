const K_MAX_BITS = 30;

class XorBasisManager {
    constructor(initialValues = []) {
        this.basisStorage = new Array(K_MAX_BITS).fill(0);
        this.currentBasisSize = 0;
        this.representsEmptySet = false;

        for (const val of initialValues) {
            this.absorbValue(val);
        }
    }

    absorbValue(value) {
        if (this.representsEmptySet) return false;

        for (let bitIndex = K_MAX_BITS - 1; bitIndex >= 0; bitIndex--) {
            if (!((value >> bitIndex) & 1)) continue;
            if (this.basisStorage[bitIndex] === 0) {
                this.basisStorage[bitIndex] = value;
                this.currentBasisSize++;
                return true;
            }
            value ^= this.basisStorage[bitIndex];
        }
        return false;
    }

    checkFormability(value) {
        if (this.representsEmptySet) return false;

        for (let bitIndex = K_MAX_BITS - 1; bitIndex >= 0; bitIndex--) {
            if (!((value >> bitIndex) & 1)) continue;
            value ^= this.basisStorage[bitIndex];
        }
        return value === 0;
    }

    createCopy() {
        const newManager = new XorBasisManager();
        newManager.basisStorage = [...this.basisStorage];
        newManager.currentBasisSize = this.currentBasisSize;
        newManager.representsEmptySet = this.representsEmptySet;
        return newManager;
    }

    markAsEmpty() {
        this.basisStorage.fill(0);
        this.currentBasisSize = 0;
        this.representsEmptySet = true;
    }

    isEffectivelyEmpty() {
        return this.representsEmptySet;
    }
}

function processXorConditions(itemCount, valueStrings, conditionSequence) {
    const totalItems = itemCount;
    const numericValues = valueStrings.map(Number);
    const basisCollection = new Array(totalItems + 1);

    basisCollection[0] = new XorBasisManager();

    for (let step = 1; step <= totalItems; step++) {
        const currentItemIndex = totalItems - step;
        const currentNumericValue = numericValues[currentItemIndex];
        const currentConditionChar = conditionSequence[currentItemIndex];

        const priorBasis = basisCollection[step - 1];

        if (priorBasis.isEffectivelyEmpty()) {
            const nextBasis = new XorBasisManager();
            nextBasis.markAsEmpty();
            basisCollection[step] = nextBasis;
            continue;
        }

        let nextBasis = priorBasis.createCopy();

        if (currentConditionChar === '0') {
            nextBasis.absorbValue(currentNumericValue);
        } else {
            if (!priorBasis.checkFormability(currentNumericValue)) {
                nextBasis.markAsEmpty();
            }
        }
        basisCollection[step] = nextBasis;
    }

    return !basisCollection[totalItems].isEffectivelyEmpty();
}

function handleInput(data) {
    const dataLines = data.split('\n');
    const testCases = Number(dataLines[0]);
    let currentLine = 1;

    for (let i = 0; i < testCases; i++) {
        const N_str = dataLines[currentLine++];
        const N_val = Number(N_str);
        const A_elements = dataLines[currentLine++].split(' ');
        const S_sequence = dataLines[currentLine++];

        const outcome = processXorConditions(N_val, A_elements, S_sequence);
        console.log(outcome ? '0' : '1');
    }
}

handleInput(require("fs").readFileSync("/dev/stdin", "utf8"));
