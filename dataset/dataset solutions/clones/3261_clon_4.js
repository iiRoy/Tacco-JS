const extractNumbersFromLine = (dataSegment) => (Array.isArray(dataSegment) ? dataSegment : dataSegment.split(/\s+/)).map(Number);

class Consumable {
    constructor(category, savor, identifier) {
        this.category = category;
        this.savor = savor;
        this.identifier = identifier;
    }
}

const executeOptimalSelection = (rawInputContent) => {
    const parsedInputSegments = rawInputContent.split('\n');

    const [totalSushiPieces, desiredSelectionCount] = extractNumbersFromLine(parsedInputSegments[0]);

    const allSushiItemsDetailed = parsedInputSegments.slice(1, totalSushiPieces + 1).map((segment, idx) => {
        const [c, s] = extractNumbersFromLine(segment);
        return new Consumable(c, s, idx);
    });

    allSushiItemsDetailed.sort((a, b) => {
        if (a.category < b.category) return -1;
        if (a.category > b.category) return 1;
        return b.savor - a.savor;
    });

    const allSushiSortedByDeliciousness = [...allSushiItemsDetailed].sort((a, b) => b.savor - a.savor);

    const sushiTypeCategorization = new Map();
    let currentCategoryIdentifier = -1;
    let currentCategoryBatch = null;

    for (const individualSushiItem of allSushiItemsDetailed) {
        if (individualSushiItem.category !== currentCategoryIdentifier) {
            if (currentCategoryBatch) {
                sushiTypeCategorization.set(currentCategoryIdentifier, currentCategoryBatch);
            }
            currentCategoryIdentifier = individualSushiItem.category;
            currentCategoryBatch = [];
        }
        currentCategoryBatch.push(individualSushiItem);
    }
    if (currentCategoryBatch) {
        sushiTypeCategorization.set(currentCategoryIdentifier, currentCategoryBatch);
    }

    const uniqueCategoryIdentifiers = Array.from(sushiTypeCategorization.keys());

    const selectionStatusFlags = new Set();
    let currentDeliciousnessSum = 0;
    let currentUniqueCategories = 0;

    const initialCategorySelections = [];
    const mostSavorOfEachType = uniqueCategoryIdentifiers.map(category => sushiTypeCategorization.get(category)[0]);

    if (uniqueCategoryIdentifiers.length >= desiredSelectionCount) {
        for (const itemForReview of mostSavorOfEachType) {
            selectionStatusFlags.add(itemForReview.identifier);
            currentDeliciousnessSum += itemForReview.savor;
            initialCategorySelections.push(itemForReview);
        }
        currentUniqueCategories = desiredSelectionCount;
    } else {
        for (const itemForReview of mostSavorOfEachType) {
            selectionStatusFlags.add(itemForReview.identifier);
            currentDeliciousnessSum += itemForReview.savor;
            initialCategorySelections.push(itemForReview);
        }
        currentUniqueCategories = uniqueCategoryIdentifiers.length;

        let additionalItemsNeeded = desiredSelectionCount - initialCategorySelections.length;
        let replacementSearchIndex = 0;
        while (additionalItemsNeeded > 0 && replacementSearchIndex < totalSushiPieces) {
            const potentialDish = allSushiSortedByDeliciousness[replacementSearchIndex];
            if (!selectionStatusFlags.has(potentialDish.identifier)) {
                selectionStatusFlags.add(potentialDish.identifier);
                currentDeliciousnessSum += potentialDish.savor;
                additionalItemsNeeded--;
            }
            replacementSearchIndex++;
        }
    }

    initialCategorySelections.sort((a, b) => a.savor - b.savor);

    let replacementSearchCursor = 0;

    for (let i = 0; i < initialCategorySelections.length; i++) {
        const removedItem = initialCategorySelections[i];

        let swapPerformed = false;
        for (; replacementSearchCursor < totalSushiPieces; replacementSearchCursor++) {
            const introducedItem = allSushiSortedByDeliciousness[replacementSearchCursor];

            if (selectionStatusFlags.has(introducedItem.identifier)) {
                continue;
            }

            const baseScore = currentDeliciousnessSum + (currentUniqueCategories * currentUniqueCategories);
            const revisedScore = (currentDeliciousnessSum - removedItem.savor + introducedItem.savor) + ((currentUniqueCategories - 1) * (currentUniqueCategories - 1));

            if (baseScore < revisedScore) {
                currentDeliciousnessSum += introducedItem.savor - removedItem.savor;
                currentUniqueCategories--;
                selectionStatusFlags.delete(removedItem.identifier);
                selectionStatusFlags.add(introducedItem.identifier);
                swapPerformed = true;
                break;
            } else {
                console.log(baseScore);
                return;
            }
        }
    }

    console.log(currentDeliciousnessSum + (currentUniqueCategories * currentUniqueCategories));
};

executeOptimalSelection(require('fs').readFileSync('/dev/stdin', 'utf8'));