class MaximumHeap {
    constructor() {
        this.storage = [];
    }

    obtainParentIndex(idx) { return Math.floor((idx - 1) / 2); }
    obtainLeftChildIndex(idx) { return 2 * idx + 1; }
    obtainRightChildIndex(idx) { return 2 * idx + 2; }

    hasSuperior(idx) { return this.obtainParentIndex(idx) >= 0; }
    hasLeftDescendant(idx) { return this.obtainLeftChildIndex(idx) < this.storage.length; }
    hasRightDescendant(idx) { return this.obtainRightChildIndex(idx) < this.storage.length; }

    fetchSuperior(idx) { return this.storage[this.obtainParentIndex(idx)]; }
    fetchLeftDescendant(idx) { return this.storage[this.obtainLeftChildIndex(idx)]; }
    fetchRightDescendant(idx) { return this.storage[this.obtainRightChildIndex(idx)]; }

    exchangeElements(idx1, idx2) {
        [this.storage[idx1], this.storage[idx2]] = [this.storage[idx2], this.storage[idx1]];
    }

    reviewPeak() {
        if (this.storage.length === 0) return null;
        return this.storage[0];
    }

    addElement(unitData) { // unitData is [count, identifier]
        this.storage.push(unitData);
        this.organizeUpwards();
    }

    extractTopElement() {
        if (this.storage.length === 0) return null;
        if (this.storage.length === 1) return this.storage.pop();

        const topItem = this.storage[0];
        this.storage[0] = this.storage.pop();
        this.organizeDownwards();
        return topItem;
    }

    organizeUpwards() {
        let currentIndex = this.storage.length - 1;
        while (this.hasSuperior(currentIndex) && this.fetchSuperior(currentIndex)[0] < this.storage[currentIndex][0]) {
            this.exchangeElements(this.obtainParentIndex(currentIndex), currentIndex);
            currentIndex = this.obtainParentIndex(currentIndex);
        }
    }

    organizeDownwards() {
        let currentIndex = 0;
        while (this.hasLeftDescendant(currentIndex)) {
            let largerChildIdx = this.obtainLeftChildIndex(currentIndex);
            if (this.hasRightDescendant(currentIndex) && this.fetchRightDescendant(currentIndex)[0] > this.fetchLeftDescendant(currentIndex)[0]) {
                largerChildIdx = this.obtainRightChildIndex(currentIndex);
            }

            if (this.storage[currentIndex][0] > this.storage[largerChildIdx][0]) {
                break;
            } else {
                this.exchangeElements(currentIndex, largerChildIdx);
            }
            currentIndex = largerChildIdx;
        }
    }

    getSize() {
        return this.storage.length;
    }
}

function processAllocationScenario(sourceText) {
    const dataLines = sourceText.trim().split('\n');
    const [totalCycles, distinctEntities] = dataLines[0].split(' ').map(Number);
    const initialEntityVolumes = dataLines[1].split(' ').map(Number);

    const entityHeap = new MaximumHeap();
    initialEntityVolumes.forEach((volumeValue, entityIdentifier) => {
        if (volumeValue > 0) {
            entityHeap.addElement([volumeValue, entityIdentifier]); // [volume, id]
        }
    });

    let previouslySelectedEntity = -1;
    let successiveConflictCount = 0;

    for (let currentCycle = 0; currentCycle < totalCycles; ++currentCycle) {
        let primaryChoice = entityHeap.extractTopElement();

        if (primaryChoice === null) {
            break; // No more entities to allocate
        }

        if (primaryChoice[1] === previouslySelectedEntity) {
            // The most abundant entity was the one picked in the prior cycle.
            // Attempt to find an alternate.
            let secondaryChoice = entityHeap.extractTopElement();

            if (secondaryChoice !== null) {
                // An alternative entity is available. Select it.
                secondaryChoice[0]--; // Decrease volume
                if (secondaryChoice[0] > 0) {
                    entityHeap.addElement(secondaryChoice);
                }
                entityHeap.addElement(primaryChoice); // Return primary choice to heap, unchanged for this cycle.
                previouslySelectedEntity = secondaryChoice[1];
            } else {
                // No alternative. Forced to select the primary choice again.
                primaryChoice[0]--;
                successiveConflictCount++;
                if (primaryChoice[0] > 0) {
                    entityHeap.addElement(primaryChoice);
                }
                previouslySelectedEntity = primaryChoice[1];
            }
        } else {
            // The most abundant entity is different from the prior selection, or this is the first cycle.
            // Select it.
            primaryChoice[0]--;
            if (primaryChoice[0] > 0) {
                entityHeap.addElement(primaryChoice);
            }
            previouslySelectedEntity = primaryChoice[1];
        }
    }

    console.log(successiveConflictCount);
}

processAllocationScenario(require("fs").readFileSync("/dev/stdin", "utf8"));