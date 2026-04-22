class SmallestFirstQueue {
    constructor() {
        this.data = [];
    }

    _comparison(a, b) {
        return a - b;
    }

    _exchange(i, j) {
        [this.data[i], this.data[j]] = [this.data[j], this.data[i]];
    }

    _moveUp(idx) {
        let parentIdx = Math.floor((idx - 1) / 2);
        while (idx > 0 && this._comparison(this.data[idx], this.data[parentIdx]) < 0) {
            this._exchange(idx, parentIdx);
            idx = parentIdx;
            parentIdx = Math.floor((idx - 1) / 2);
        }
    }

    _moveDown(idx) {
        const finalIdx = this.data.length - 1;
        while (true) {
            let childLeft = 2 * idx + 1;
            let childRight = 2 * idx + 2;
            let targetIdx = idx;

            if (childLeft <= finalIdx && this._comparison(this.data[childLeft], this.data[targetIdx]) < 0) {
                targetIdx = childLeft;
            }

            if (childRight <= finalIdx && this._comparison(this.data[childRight], this.data[targetIdx]) < 0) {
                targetIdx = childRight;
            }

            if (targetIdx !== idx) {
                this._exchange(idx, targetIdx);
                idx = targetIdx;
            } else {
                break;
            }
        }
    }

    add(val) {
        this.data.push(val);
        this._moveUp(this.data.length - 1);
    }

    extract() {
        if (this.isEmpty()) {
            return undefined;
        }
        if (this.data.length === 1) {
            return this.data.pop();
        }
        const rootItem = this.data[0];
        this.data[0] = this.data.pop();
        this._moveDown(0);
        return rootItem;
    }

    examine() {
        return this.isEmpty() ? undefined : this.data[0];
    }

    isEmpty() {
        return this.data.length === 0;
    }

    size() {
        return this.data.length;
    }
}

class LargestFirstQueue extends SmallestFirstQueue {
    _comparison(a, b) {
        return b - a;
    }
}

function ProcessCommands(programInput) {
    let instructionLines = programInput.split("\n");
    if (instructionLines[instructionLines.length - 1] === '') {
        instructionLines.pop();
    }

    const initialParameter = instructionLines[0].split(' ')[0]; // This value is read but not used in the original.

    let lowerHalfElements = new LargestFirstQueue();
    let upperHalfElements = new SmallestFirstQueue();
    let totalComputedValue = 0;

    function maintainBalance() {
        if (lowerHalfElements.size() > upperHalfElements.size() + 1) {
            upperHalfElements.add(lowerHalfElements.extract());
        } else if (upperHalfElements.size() > lowerHalfElements.size()) {
            lowerHalfElements.add(upperHalfElements.extract());
        }
    }

    function executeOperation(commandString) {
        const parts = commandString.split(' ');
        if (parts[0] === '2') {
            const currentMiddleElement = lowerHalfElements.examine();
            console.log(currentMiddleElement, totalComputedValue);
        } else {
            const valueForCollection = parseInt(parts[1], 10);
            const additiveValue = parseInt(parts[2], 10);

            let operationCost = 0;
            const currentTotalCount = lowerHalfElements.size() + upperHalfElements.size();

            if (currentTotalCount === 0) {
                lowerHalfElements.add(valueForCollection);
                totalComputedValue += additiveValue;
                return;
            }

            const currentLowerMiddle = lowerHalfElements.examine();
            const currentUpperMiddle = upperHalfElements.examine();

            if (currentTotalCount % 2 === 0) { // Even count before adding
                if (valueForCollection > currentUpperMiddle) {
                    operationCost = valueForCollection - currentUpperMiddle;
                } else if (valueForCollection < currentLowerMiddle) {
                    operationCost = currentLowerMiddle - valueForCollection;
                }
            } else { // Odd count before adding
                operationCost = Math.abs(valueForCollection - currentLowerMiddle);
            }

            totalComputedValue += operationCost;
            totalComputedValue += additiveValue;

            if (valueForCollection <= currentLowerMiddle) {
                lowerHalfElements.add(valueForCollection);
            } else {
                upperHalfElements.add(valueForCollection);
            }
            maintainBalance();
        }
    }

    for (let instructionIndex = 1; instructionIndex < instructionLines.length; instructionIndex++) {
        executeOperation(instructionLines[instructionIndex]);
    }
}

ProcessCommands(require("fs").readFileSync("/dev/stdin", "utf8"));