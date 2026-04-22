(function() {
    class PriorityStructure {
        constructor() {
            this.heapItems = [];
        }

        _retrieveParentIndex(itemIndex) { return Math.floor((itemIndex - 1) / 2); }
        _retrieveLeftChildIndex(itemIndex) { return 2 * itemIndex + 1; }
        _retrieveRightChildIndex(itemIndex) { return 2 * itemIndex + 2; }

        _hasParentItem(itemIndex) { return this._retrieveParentIndex(itemIndex) >= 0; }
        _hasLeftChildItem(itemIndex) { return this._retrieveLeftChildIndex(itemIndex) < this.heapItems.length; }
        _hasRightChildItem(itemIndex) { return this._retrieveRightChildIndex(itemIndex) < this.heapItems.length; }

        _getParentItem(itemIndex) { return this.heapItems[this._retrieveParentIndex(itemIndex)]; }
        _getLeftChildItem(itemIndex) { return this.heapItems[this._retrieveLeftChildIndex(itemIndex)]; }
        _getRightChildItem(itemIndex) { return this.heapItems[this._retrieveRightChildIndex(itemIndex)]; }

        _exchangePositions(idxA, idxB) {
            [this.heapItems[idxA], this.heapItems[idxB]] = [this.heapItems[idxB], this.heapItems[idxA]];
        }

        _compareValues(elementA, elementB) {
            return (elementA[0] / elementA[1]) - (elementB[0] / elementB[1]);
        }

        _heapifyUp() {
            let currentIdx = this.heapItems.length - 1;
            while (this._hasParentItem(currentIdx) && this._compareValues(this.heapItems[currentIdx], this._getParentItem(currentIdx)) > 0) {
                this._exchangePositions(currentIdx, this._retrieveParentIndex(currentIdx));
                currentIdx = this._retrieveParentIndex(currentIdx);
            }
        }

        _heapifyDown() {
            let currentIdx = 0;
            while (this._hasLeftChildItem(currentIdx)) {
                let dominantChildIdx = this._retrieveLeftChildIndex(currentIdx);
                if (this._hasRightChildItem(currentIdx) && this._compareValues(this._getRightChildItem(currentIdx), this._getLeftChildItem(currentIdx)) > 0) {
                    dominantChildIdx = this._retrieveRightChildIndex(currentIdx);
                }

                if (this._compareValues(this.heapItems[currentIdx], this.heapItems[dominantChildIdx]) > 0) {
                    break;
                } else {
                    this._exchangePositions(currentIdx, dominantChildIdx);
                    currentIdx = dominantChildIdx;
                }
            }
        }

        incorporate(itemData) {
            this.heapItems.push(itemData);
            this._heapifyUp();
        }

        extractTop() {
            if (this.heapItems.length === 0) return null;
            if (this.heapItems.length === 1) return this.heapItems.pop();

            const topItem = this.heapItems[0];
            this.heapItems[0] = this.heapItems.pop();
            this._heapifyDown();
            return topItem;
        }

        peekTop() {
            if (this.heapItems.length === 0) return null;
            return this.heapItems[0];
        }

        get currentSize() {
            return this.heapItems.length;
        }
    }

    let accumulatedText = '';

    global.process.stdin.on('data', (receivedSegment) => {
        accumulatedText += receivedSegment.toString();
    });

    global.process.stdin.on('end', () => {
        const textBlocks = accumulatedText.split(/\n/);

        const firstLineValues = textBlocks.shift().split(/\s/).map(Number);
        const dimensionCount = firstLineValues[0];
        const operationQuota = firstLineValues[1];

        const initialValues = textBlocks[0].split(/\s/).slice(0, dimensionCount).map(Number);

        const dataProcessor = new PriorityStructure();
        for (const initialVal of initialValues) {
            dataProcessor.incorporate([initialVal, 1]);
        }

        for (let iterationIndex = 0; iterationIndex < operationQuota; iterationIndex++) {
            const highestPriorityElement = dataProcessor.extractTop();
            if (!highestPriorityElement) break;

            highestPriorityElement[1]++;
            dataProcessor.incorporate(highestPriorityElement);
        }

        const finalDominantElement = dataProcessor.peekTop();
        const finalCalculation = finalDominantElement[0] / finalDominantElement[1];

        const determineCeiling = (numericalInput) => {
            return (numericalInput > Math.trunc(numericalInput)) ? (Math.trunc(numericalInput) + 1) : Math.trunc(numericalInput);
        };

        global.process.stdout.write(determineCeiling(finalCalculation) + '\n');
    });
})();