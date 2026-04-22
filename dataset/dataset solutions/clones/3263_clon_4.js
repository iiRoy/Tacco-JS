'use strict'

const obtainLines = () => require("fs").readFileSync("/dev/stdin", "utf8").split('\n');
let currentLineIndex = 0;
const allProgramInput = obtainLines();

const retrieveLine = () => allProgramInput[currentLineIndex++];
const retrieveNumericArray = () => retrieveLine().split(' ').map(Number);
const retrieveNumericMatrix = (itemCount) => {
    const resultMatrix = [];
    for (let i = 0; i < itemCount; i++) {
        resultMatrix.push(retrieveLine().split(' ').map(Number));
    }
    return resultMatrix;
};

const dataHandlingUtilities = {
    calculateTotal: (arrayElements) => arrayElements.reduce((accumulator, current) => accumulator + current, 0),
    findGreatest: (arrayElements) => arrayElements.reduce((accumulator, current) => (current > accumulator ? current : accumulator), -Infinity),
    selectTopElements: (collection, count) => collection.slice(0, count)
};

const performSolutionLogic = () => {
    const configurationParameters = retrieveNumericArray(); // [TotalN, InitialK]
    const initialSelectionLimit = configurationParameters[1];
    const entireItemList = retrieveNumericMatrix(configurationParameters[0]);

    // Sort the entire item list by item value (second element) in descending order
    entireItemList.sort((a, b) => b[1] - a[1]);

    // Initial selection comprises the top 'initialSelectionLimit' items
    const currentActiveSet = dataHandlingUtilities.selectTopElements(entireItemList, initialSelectionLimit);

    const typeOccurrenceMap = new Map(); // Maps item type (kind) to its count
    let currentSumOfValues = 0;
    let currentUniqueTypeCount = 0;

    for (const item of currentActiveSet) {
        const itemTypeIdentifier = item[0];
        const itemNumericValue = item[1];
        typeOccurrenceMap.set(itemTypeIdentifier, (typeOccurrenceMap.get(itemTypeIdentifier) || 0) + 1);
        currentSumOfValues += itemNumericValue;
    }
    currentUniqueTypeCount = typeOccurrenceMap.size;

    const historicalValueSums = new Map(); // Maps unique type count to the total sum of values
    historicalValueSums.set(currentUniqueTypeCount, currentSumOfValues);

    // This list will function as a min-priority queue for items that can be removed.
    // It stores full [kind, value] items and is kept sorted by value (index 1) in ascending order.
    let potentialRemovalCandidates = [];
    for (const item of currentActiveSet) {
        // Initially, only items with duplicate types are considered for removal
        if (typeOccurrenceMap.get(item[0]) > 1) {
            potentialRemovalCandidates.push(item);
        }
    }
    potentialRemovalCandidates.sort((a, b) => a[1] - b[1]); // Sort by item value ascending

    let nextAvailableItemIndex = initialSelectionLimit; // Pointer for the entireItemList

    while (potentialRemovalCandidates.length > 0 && nextAvailableItemIndex < entireItemList.length) {
        // Get the item with the smallest value from the potential removal candidates
        const itemBeingConsideredForRemoval = potentialRemovalCandidates[0]; // [kind, value]
        const typeOfItemToRemove = itemBeingConsideredForRemoval[0];
        const valueOfItemToRemove = itemBeingConsideredForRemoval[1];

        // Check if this item's type is still a duplicate within the active set
        if (typeOccurrenceMap.get(typeOfItemToRemove) < 2) {
            // If its type count dropped to 1, it's no longer a suitable candidate for removal
            // to increase distinct types. Remove it from candidates and proceed.
            potentialRemovalCandidates.shift();
            continue;
        }

        let replacementOptionFound = false;
        let itemToInclude = null;

        // Search for an item from the remaining catalogue that introduces a new type
        while (nextAvailableItemIndex < entireItemList.length && !replacementOptionFound) {
            const candidateForInclusion = entireItemList[nextAvailableItemIndex]; // [kind, value]
            const typeOfCandidate = candidateForInclusion[0];

            if (!typeOccurrenceMap.has(typeOfCandidate)) { // If this type is not currently in the active set
                replacementOptionFound = true;
                itemToInclude = candidateForInclusion;
            }
            nextAvailableItemIndex++;
        }

        if (!replacementOptionFound) {
            // No more suitable items to add that introduce new types, terminate the process
            break;
        }

        // Execute the exchange: remove itemBeingConsideredForRemoval, add itemToInclude
        currentSumOfValues -= valueOfItemToRemove;
        currentSumOfValues += itemToInclude[1];

        typeOccurrenceMap.set(typeOfItemToRemove, typeOccurrenceMap.get(typeOfItemToRemove) - 1);
        typeOccurrenceMap.set(itemToInclude[0], 1); // New type, its count starts at 1

        currentUniqueTypeCount++;
        historicalValueSums.set(currentUniqueTypeCount, currentSumOfValues);

        // Update the list of potential removal candidates
        potentialRemovalCandidates.shift(); // Remove the item that was discarded

        // The newly added item also becomes a potential candidate for removal later.
        // It's added regardless of its current type count (which is 1 for a new type).
        potentialRemovalCandidates.push(itemToInclude); // Add the full [kind, value] item
        potentialRemovalCandidates.sort((a, b) => a[1] - b[1]); // Re-sort to maintain min-priority order
    }

    // Compute the final scores based on the historical sums and unique type counts
    const possibleFinalScores = [];
    historicalValueSums.forEach((summation, distinctCount) => {
        possibleFinalScores.push(summation + distinctCount * distinctCount);
    });

    console.log(dataHandlingUtilities.findGreatest(possibleFinalScores));
};

// Begin the execution flow
performSolutionLogic();