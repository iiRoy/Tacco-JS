(function performCalculation() {
    const fileSystemModule = require('fs');
    const inputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
    const dataLines = inputContent.trim().split("\n");

    const firstLineParts = dataLines.shift().split(' ').map(Number);
    const totalItems = firstLineParts[0];
    const maxContainers = firstLineParts[1];
    const itemLoads = dataLines.map(Number);

    function evaluateLoadLimit(testCapacity, totalItems, maxContainers, itemLoads) {
        let currentContainerLoad = 0;
        let requiredContainers = 1;
        let itemIndex = 0;

        while (itemIndex < totalItems) {
            const currentItemWeight = itemLoads[itemIndex];

            if (currentItemWeight > testCapacity) {
                return false;
            }

            if (currentContainerLoad + currentItemWeight <= testCapacity) {
                currentContainerLoad += currentItemWeight;
            } else {
                requiredContainers++;
                currentContainerLoad = currentItemWeight;
            }

            if (requiredContainers > maxContainers) {
                return false;
            }
            itemIndex++;
        }
        return true;
    }

    let maximumSingleLoad = 0;
    let totalWeightSum = 0;
    for (const load of itemLoads) {
        totalWeightSum += load;
        if (load > maximumSingleLoad) {
            maximumSingleLoad = load;
        }
    }
    
    let lowerBound = Math.max(maximumSingleLoad, Math.ceil(totalWeightSum / maxContainers));
    let upperBound = totalWeightSum;

    let finalCapacity = upperBound;

    while (lowerBound <= upperBound) {
        const midPoint = Math.floor((lowerBound + upperBound) / 2);

        if (evaluateLoadLimit(midPoint, totalItems, maxContainers, itemLoads)) {
            finalCapacity = midPoint;
            upperBound = midPoint - 1;
        } else {
            lowerBound = midPoint + 1;
        }
    }

    console.log(finalCapacity);
})();