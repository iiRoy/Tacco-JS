(function processInput() {
    let rawData = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n");
    let [totalItems, desiredContainers] = rawData.shift().split(' ').map(Number);
    let individualWeights = rawData.map(Number);

    if (desiredContainers === 1) {
        let entireLoad = individualWeights.reduce((acc, current) => acc + current, 0);
        console.log(entireLoad);
        return;
    }

    let minimumPossibleCapacity = 0;
    for (let weight of individualWeights) {
        if (weight > minimumPossibleCapacity) {
            minimumPossibleCapacity = weight;
        }
    }
    let maximumPossibleCapacity = individualWeights.reduce((acc, current) => acc + current, 0);

    let optimalCapacity = maximumPossibleCapacity;

    const canDistribute = (maxAllowedSum) => {
        let currentContainerSum = 0;
        let containersUsed = 1;

        for (let itemValue of individualWeights) {
            if (itemValue > maxAllowedSum) {
                return false;
            }

            if (currentContainerSum + itemValue <= maxAllowedSum) {
                currentContainerSum += itemValue;
            } else {
                containersUsed++;
                currentContainerSum = itemValue;
            }
        }
        return containersUsed <= desiredContainers;
    };

    let lowerBound = minimumPossibleCapacity;
    let upperBound = maximumPossibleCapacity;

    while (lowerBound <= upperBound) {
        let midPoint = Math.floor((lowerBound + upperBound) / 2);
        if (canDistribute(midPoint)) {
            optimalCapacity = midPoint;
            upperBound = midPoint - 1;
        } else {
            lowerBound = midPoint + 1;
        }
    }

    console.log(optimalCapacity);
})();