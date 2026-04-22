function performCalculation(dataSource) {
    const firstLineElements = dataSource[0].trim().split(" ");
    const initialValue = parseFloat(firstLineElements[0]);
    const exclusionCount = parseFloat(firstLineElements[1]);

    if (exclusionCount === 0) {
        return initialValue;
    } else {
        const excludedStrings = dataSource[1].trim().split(" ");
        const prohibitedSet = new Set(excludedStrings.map(str => parseFloat(str)));

        const findNearestAllowed = (basePoint, currentDisplacement, prohibitedItems) => {
            const lowerCandidate = basePoint - currentDisplacement;
            if (!prohibitedItems.has(lowerCandidate)) {
                return lowerCandidate;
            }

            const upperCandidate = basePoint + currentDisplacement;
            if (!prohibitedItems.has(upperCandidate)) {
                return upperCandidate;
            }

            return findNearestAllowed(basePoint, currentDisplacement + 1, prohibitedItems);
        };

        return findNearestAllowed(initialValue, 0, prohibitedSet);
    }
}

const obtainInputData = () => require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n");
const finalResult = performCalculation(obtainInputData());
console.info(finalResult);