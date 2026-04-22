function acquireInput() {
    return require('node:fs').readFileSync(0, 'utf8');
}

function decipherNumbers(textline) {
    return textline.split(/\s+/).map(Number);
}

function determinePartners(value) {
    let partnerCandidates = [];
    for (let p = 1; p <= 31; ++p) {
        let limit = 1 << p;
        let needed = limit - value;
        if (needed > 0) {
            partnerCandidates.push(needed);
        }
    }
    return partnerCandidates;
}

function decrementTally(collection, element) {
    if (collection[element] !== undefined && collection[element] > 0) {
        collection[element]--;
        if (collection[element] === 0) {
            delete collection[element];
        }
        return true;
    }
    return false;
}

function processData(rawData) {
    let dataLines = rawData.split('\n');
    let totalItems = parseInt(dataLines[0]);
    let numericSequence = decipherNumbers(dataLines[1]).slice(0, totalItems);

    let itemCounts = {};
    for (let currentItem of numericSequence) {
        itemCounts[currentItem] = (itemCounts[currentItem] || 0) + 1;
    }

    let finalSum = 0;

    function traverseComponent(currentVertexValue, currentSideAssigned, availableCountsRef, componentAggregatesRef, partnerGenerator, countModifier) {
        if (currentSideAssigned) {
            componentAggregatesRef.sideA++;
        } else {
            componentAggregatesRef.sideB++;
        }

        let possibleComplements = partnerGenerator(currentVertexValue);

        for (let complement of possibleComplements) {
            if (availableCountsRef[complement] !== undefined && availableCountsRef[complement] > 0) {
                if (countModifier(availableCountsRef, complement)) {
                    traverseComponent(complement, !currentSideAssigned, availableCountsRef, componentAggregatesRef, partnerGenerator, countModifier);
                }
            }
        }
    }

    while (Object.keys(itemCounts).length > 0) {
        let initialNodeKey = Object.keys(itemCounts)[0];
        let initialNodeValue = parseInt(initialNodeKey);

        let componentAggregates = {
            sideA: 0,
            sideB: 0
        };

        if (decrementTally(itemCounts, initialNodeValue)) {
            traverseComponent(initialNodeValue, true, itemCounts, componentAggregates, determinePartners, decrementTally);
        }

        finalSum += Math.min(componentAggregates.sideA, componentAggregates.sideB);
    }

    console.log(finalSum);
}

processData(acquireInput());