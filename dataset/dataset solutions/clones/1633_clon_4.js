(async () => {
    let entireStream = '';

    process.stdin.on('data', (fragment) => {
        entireStream += fragment;
    });

    process.stdin.on('end', () => {
        const textBlocks = entireStream.split(/\n/);

        const [limitCount, operationsCount] = textBlocks.shift().split(/\s/).map(raw => parseInt(raw, 10));

        const valueMaximizer = new MaximizationProcessor();
        textBlocks[0].split(/\s/).slice(0, limitCount).forEach(raw => {
            const val = parseInt(raw, 10);
            valueMaximizer.addElement(val, 1);
        });

        for (let opIdx = 0; opIdx < operationsCount; opIdx++) {
            const currentPeak = valueMaximizer.extractHighest();
            if (currentPeak) {
                currentPeak.divisionCount++;
                valueMaximizer.addElement(currentPeak.initialValue, currentPeak.divisionCount);
            } else {
                break;
            }
        }

        const finalPeak = valueMaximizer.peekHighest();
        if (finalPeak) {
            const finalComputedValue = finalPeak.initialValue / finalPeak.divisionCount;
            console.log(Math.ceil(finalComputedValue));
        } else {
            console.log(0);
        }
    });
})();

class MaximizationProcessor {
    constructor() {
        this.dataStore = [];
    }

    _getAncestorIndex(idx) { return Math.floor((idx - 1) / 2); }
    _getLeftDescendantIndex(idx) { return 2 * idx + 1; }
    _getRightDescendantIndex(idx) { return 2 * idx + 2; }

    _exchangePositions(idx1, idx2) {
        [this.dataStore[idx1], this.dataStore[idx2]] = [this.dataStore[idx2], this.dataStore[idx1]];
    }

    _isDominant(idx1, idx2) {
        if (idx1 >= this.dataStore.length || idx2 >= this.dataStore.length) return false;
        const item1 = this.dataStore[idx1];
        const item2 = this.dataStore[idx2];
        return (item1.initialValue / item1.divisionCount) > (item2.initialValue / item2.divisionCount);
    }

    _ascend() {
        let currentIdx = this.dataStore.length - 1;
        while (currentIdx > 0) {
            const parentIdx = this._getAncestorIndex(currentIdx);
            if (this._isDominant(currentIdx, parentIdx)) {
                this._exchangePositions(currentIdx, parentIdx);
                currentIdx = parentIdx;
            } else {
                break;
            }
        }
    }

    _descend() {
        let currentIdx = 0;
        const totalSize = this.dataStore.length;
        while (true) {
            const leftChildIdx = this._getLeftDescendantIndex(currentIdx);
            const rightChildIdx = this._getRightDescendantIndex(currentIdx);
            let mostDominantIdx = currentIdx;

            if (leftChildIdx < totalSize && this._isDominant(leftChildIdx, mostDominantIdx)) {
                mostDominantIdx = leftChildIdx;
            }
            if (rightChildIdx < totalSize && this._isDominant(rightChildIdx, mostDominantIdx)) {
                mostDominantIdx = rightChildIdx;
            }

            if (mostDominantIdx !== currentIdx) {
                this._exchangePositions(currentIdx, mostDominantIdx);
                currentIdx = mostDominantIdx;
            } else {
                break;
            }
        }
    }

    addElement(initialVal, divisionCount) {
        this.dataStore.push({ initialValue: initialVal, divisionCount: divisionCount });
        this._ascend();
    }

    extractHighest() {
        if (this.dataStore.length === 0) return null;
        if (this.dataStore.length === 1) return this.dataStore.pop();

        const highestItem = this.dataStore[0];
        this.dataStore[0] = this.dataStore.pop();
        this._descend();
        return highestItem;
    }

    peekHighest() {
        return this.dataStore.length > 0 ? this.dataStore[0] : null;
    }

    getSize() {
        return this.dataStore.length;
    }
}