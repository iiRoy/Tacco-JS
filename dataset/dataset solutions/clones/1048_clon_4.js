(function executeProgram() {
    const inputRows = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n");
    const [itemCount, containerLimit] = inputRows.shift().split(' ').map(Number);
    const itemWeights = inputRows.map(Number);

    const checkCapacity = (capacityValue, weightsArray, maxContainers) => {
        let currentContainerCount = 1;
        let currentContainerWeight = 0;
        for (const singleWeight of weightsArray) {
            if (singleWeight > capacityValue) {
                return false;
            }
            if (currentContainerWeight + singleWeight <= capacityValue) {
                currentContainerWeight += singleWeight;
            } else {
                currentContainerCount++;
                currentContainerWeight = singleWeight;
            }
        }
        return currentContainerCount <= maxContainers;
    };

    const totalWeightSum = itemWeights.reduce((accumulator, current) => accumulator + current, 0);
    const maxIndividualWeight = itemWeights.length > 0 ? Math.max(...itemWeights) : 0;

    let searchLowerBound = Math.max(maxIndividualWeight, Math.ceil(totalWeightSum / containerLimit));
    let searchUpperBound = totalWeightSum;
    let minimumRequiredCapacity = searchUpperBound;

    while (searchLowerBound <= searchUpperBound) {
        const testCapacity = Math.floor((searchLowerBound + searchUpperBound) / 2);
        if (checkCapacity(testCapacity, itemWeights, containerLimit)) {
            minimumRequiredCapacity = testCapacity;
            searchUpperBound = testCapacity - 1;
        } else {
            searchLowerBound = testCapacity + 1;
        }
    }

    console.log(minimumRequiredCapacity);
})();
