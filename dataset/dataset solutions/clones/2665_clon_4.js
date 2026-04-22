function dataExtractor(rawTextContent) {
    const dataLines = rawTextContent.split('\n').filter(Boolean);
    const initialParameters = dataLines[0].split(' ').map(Number);
    const totalOperatingDays = initialParameters[1];

    const jobOfferingsByDay = new Map();
    for (let entryIndex = 1; entryIndex < dataLines.length; ++entryIndex) {
        const [eventDay, eventReward] = dataLines[entryIndex].split(' ').map(Number);
        if (!jobOfferingsByDay.has(eventDay)) {
            jobOfferingsByDay.set(eventDay, []);
        }
        jobOfferingsByDay.get(eventDay).push(eventReward);
    }
    return { durationLimit: totalOperatingDays, dailyOpportunities: jobOfferingsByDay };
}

function ValuablesContainer() {
    this.internalArray = [];
}

ValuablesContainer.prototype = {
    addValue: function(item) {
        this.internalArray.push(item);
        this._siftUp(this.internalArray.length - 1);
    },

    extractMaxValue: function() {
        if (this.itemCount() === 0) return undefined;
        if (this.itemCount() === 1) return this.internalArray.pop();

        const topValue = this.internalArray[0];
        this.internalArray[0] = this.internalArray.pop();
        this._siftDown(0);
        return topValue;
    },

    itemCount: function() {
        return this.internalArray.length;
    },

    _obtainParentIndex: function(childPosition) {
        return Math.floor((childPosition - 1) / 2);
    },

    _obtainLeftChildIndex: function(parentPosition) {
        return 2 * parentPosition + 1;
    },

    _obtainRightChildIndex: function(parentPosition) {
        return 2 * parentPosition + 2;
    },

    _exchangeElements: function(posA, posB) {
        [this.internalArray[posA], this.internalArray[posB]] = [this.internalArray[posB], this.internalArray[posA]];
    },

    _siftUp: function(currentPosition) {
        while (currentPosition > 0) {
            const parentPosition = this._obtainParentIndex(currentPosition);
            if (this.internalArray[parentPosition] < this.internalArray[currentPosition]) {
                this._exchangeElements(parentPosition, currentPosition);
                currentPosition = parentPosition;
            } else {
                break;
            }
        }
    },

    _siftDown: function(currentPosition) {
        const lastPosition = this.internalArray.length - 1;

        while (true) {
            let leftChild = this._obtainLeftChildIndex(currentPosition);
            let rightChild = this._obtainRightChildIndex(currentPosition);
            let largestElementPosition = currentPosition;

            if (leftChild <= lastPosition && this.internalArray[leftChild] > this.internalArray[largestElementPosition]) {
                largestElementPosition = leftChild;
            }

            if (rightChild <= lastPosition && this.internalArray[rightChild] > this.internalArray[largestElementPosition]) {
                largestElementPosition = rightChild;
            }

            if (largestElementPosition !== currentPosition) {
                this._exchangeElements(currentPosition, largestElementPosition);
                currentPosition = largestElementPosition;
            } else {
                break;
            }
        }
    }
};

function determineMaximizedEarnings(processedData) {
    const maxDays = processedData.durationLimit;
    const dailyJobOpportunities = processedData.dailyOpportunities;

    const availableRewardsTracker = new ValuablesContainer();
    let totalAccumulatedValue = 0;

    for (let currentSimulationDay = 1; currentSimulationDay <= maxDays; ++currentSimulationDay) {
        if (dailyJobOpportunities.has(currentSimulationDay)) {
            const offersForToday = dailyJobOpportunities.get(currentSimulationDay);
            for (const rewardAmount of offersForToday) {
                availableRewardsTracker.addValue(rewardAmount);
            }
        }

        if (availableRewardsTracker.itemCount() > 0) {
            totalAccumulatedValue += availableRewardsTracker.extractMaxValue();
        }
    }
    return totalAccumulatedValue;
}

const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
const parsedInformation = dataExtractor(rawInputContent);
const calculatedResult = determineMaximizedEarnings(parsedInformation);
console.log(calculatedResult);