function processInputData(rawData) {
    const dataSegments = rawData.trim().split("\n");
    let currentSegmentIndex = 0;
    const collectedResults = [];

    while (currentSegmentIndex < dataSegments.length) {
        const currentItemCount = parseInt(dataSegments[currentSegmentIndex].split(" ")[0], 10);
        if (isNaN(currentItemCount) || currentItemCount === 0) {
            break;
        }

        let initialValueSum = 0;
        const gainOpportunities = [];

        for (let i = 0; i < currentItemCount; i++) {
            const itemDetails = dataSegments[currentSegmentIndex + i + 1].split(" ").map(Number);
            const [kIdentifier, leftValue, rightValue] = itemDetails;

            if (kIdentifier === currentItemCount || leftValue === rightValue) {
                initialValueSum += leftValue;
            } else if (leftValue > rightValue) {
                initialValueSum += rightValue;
                gainOpportunities.push([kIdentifier - 1, leftValue - rightValue]);
            } else {
                initialValueSum += leftValue;
                gainOpportunities.push([currentItemCount - kIdentifier - 1, rightValue - leftValue]);
            }
        }

        gainOpportunities.sort((a, b) => b[1] - a[1]);

        const slotRepresentatives = Array.from({ length: currentItemCount }, (_, idx) => idx);

        const findRepresentativeSlot = (targetIndex) => {
            if (targetIndex < 0) return -1;
            if (slotRepresentatives[targetIndex] === targetIndex) {
                return targetIndex;
            }
            slotRepresentatives[targetIndex] = findRepresentativeSlot(slotRepresentatives[targetIndex]);
            return slotRepresentatives[targetIndex];
        };

        let finalComputedSum = initialValueSum;

        for (const [deadlineIndex, potentialBonus] of gainOpportunities) {
            const assignedSlot = findRepresentativeSlot(deadlineIndex);
            if (assignedSlot >= 0) {
                finalComputedSum += potentialBonus;
                slotRepresentatives[assignedSlot] = findRepresentativeSlot(assignedSlot - 1);
            }
        }
        collectedResults.push(finalComputedSum);
        currentSegmentIndex += currentItemCount + 1;
    }
    collectedResults.forEach(res => console.log(res));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
