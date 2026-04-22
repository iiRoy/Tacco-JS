const processDimensionData = (rawTextContent) => {
    const numericalEntities = rawTextContent.match(/-?\d+/g).map(Number);
    
    let currentPointer = 0;
    const dimensionValue = numericalEntities[currentPointer++];
    
    const collectionAlpha = [];
    for (let entryIndex = 0; entryIndex < dimensionValue; entryIndex++) {
        collectionAlpha.push({
            horizontal: numericalEntities[currentPointer++],
            vertical: numericalEntities[currentPointer++]
        });
    }
    
    const collectionBeta = [];
    for (let entryIndex = 0; entryIndex < dimensionValue; entryIndex++) {
        collectionBeta.push({
            horizontal: numericalEntities[currentPointer++],
            vertical: numericalEntities[currentPointer++],
            availabilityStatus: true // Represents if this point is available (true) or consumed (false)
        });
    }

    const primaryComparator = (elementA, elementB) => {
        if (elementA.horizontal !== elementB.horizontal) {
            return elementA.horizontal - elementB.horizontal;
        }
        return elementA.vertical - elementB.vertical;
    };
    const sortedPrimarySet = collectionAlpha.slice().sort(primaryComparator);

    const secondaryComparator = (elementA, elementB) => {
        if (elementA.horizontal !== elementB.horizontal) {
            return elementA.horizontal - elementB.horizontal;
        }
        return elementB.vertical - elementA.vertical;
    };
    const sortedSecondarySet = collectionBeta.slice().sort(secondaryComparator);

    let totalAttainments = 0;

    const performRecursiveEvaluation = (currentAlphaIndex) => {
        if (currentAlphaIndex < 0) {
            return;
        }

        const currentAlphaElement = sortedPrimarySet[currentAlphaIndex];
        let elementMatchedInIteration = false;

        for (let betaIterator = sortedSecondarySet.length - 1; betaIterator >= 0; betaIterator--) {
            const currentBetaElement = sortedSecondarySet[betaIterator];

            if (currentBetaElement.availabilityStatus &&
                currentAlphaElement.horizontal < currentBetaElement.horizontal &&
                currentAlphaElement.vertical < currentBetaElement.vertical) {
                
                currentBetaElement.availabilityStatus = false;
                elementMatchedInIteration = true;
                break;
            }
        }

        if (elementMatchedInIteration) {
            totalAttainments++;
        }

        performRecursiveEvaluation(currentAlphaIndex - 1);
    };

    performRecursiveEvaluation(sortedPrimarySet.length - 1);

    console.log(totalAttainments);
};

const inputSourceData = require("fs").readFileSync("/dev/stdin", "utf8").trim();
processDimensionData(inputSourceData);