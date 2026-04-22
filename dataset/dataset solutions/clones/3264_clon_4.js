function processFood(dishData) {
    dishData = dishData.split("\n");
    const firstLineTokens = dishData[0].split(" ");
    const totalDishes = parseInt(firstLineTokens[0]);
    const selectionSize = parseInt(firstLineTokens[1]);

    const initialItems = [];
    const kindInformation = new Map(); // Stores { bestFlavor: number, allFlavors: number[] } for each kind

    for (let j = 1; j <= totalDishes; j++) {
        const itemTokens = dishData[j].split(" ");
        const currentKind = parseInt(itemTokens[0]);
        const currentFlavor = parseInt(itemTokens[1]);
        initialItems.push({ kind: currentKind, flavor: currentFlavor });

        if (!kindInformation.has(currentKind)) {
            kindInformation.set(currentKind, { bestFlavor: 0, allFlavors: [] });
        }
        const info = kindInformation.get(currentKind);
        info.allFlavors.push(currentFlavor);
        if (currentFlavor > info.bestFlavor) {
            info.bestFlavor = currentFlavor;
        }
    }

    // Sort all dishes by flavor in descending order
    initialItems.sort((a, b) => b.flavor - a.flavor);

    // Initialize the selection with the 'selectionSize' most flavorful items
    let currentCulinarySum = 0;
    const selectedKindCounts = new Map(); // Tracks count of each kind in the current selection
    const selectedKindSet = new Set();    // Tracks unique kinds in the current selection

    // List of items in the current selection that are duplicates (sorted by flavor ascending for removal)
    const removeCandidates = []; 

    // List of items not in the current selection that are the most flavorful of a new kind (sorted by flavor descending for addition)
    const addCandidates = []; 

    // Populate initial selection and related data structures
    for (let i = 0; i < selectionSize; i++) {
        const chosenItem = initialItems[i];
        currentCulinarySum += chosenItem.flavor;
        selectedKindCounts.set(chosenItem.kind, (selectedKindCounts.get(chosenItem.kind) || 0) + 1);
        selectedKindSet.add(chosenItem.kind);
    }

    // Identify initial removable duplicates from the 'selectionSize' chosen items
    for (let i = 0; i < selectionSize; i++) {
        const item = initialItems[i];
        if (selectedKindCounts.get(item.kind) > 1) { // If this item's kind has more than one instance in the selection
            removeCandidates.push(item);
        }
    }
    removeCandidates.sort((a, b) => a.flavor - b.flavor); // Smallest flavor duplicates first

    // Identify initial addable new kinds from items *not* in the 'selectionSize' chosen items
    for (let i = selectionSize; i < totalDishes; i++) {
        const item = initialItems[i];
        // Check if this item's kind is not yet selected AND it's the most flavorful of its kind globally
        if (!selectedKindSet.has(item.kind) && item.flavor === kindInformation.get(item.kind).bestFlavor) {
            addCandidates.push(item);
        }
    }
    addCandidates.sort((a, b) => b.flavor - a.flavor); // Largest flavor new kinds first

    let currentUniqueKinds = selectedKindSet.size;
    let currentMaxEnjoyment = currentUniqueKinds * currentUniqueKinds + currentCulinarySum;

    // Iteratively improve the selection by swapping a duplicate for a new unique kind
    while (removeCandidates.length > 0 && addCandidates.length > 0) {
        const removed = removeCandidates.shift(); // Remove the least flavorful duplicate
        const added = addCandidates.shift();     // Add the most flavorful new kind

        // Perform the swap
        currentCulinarySum -= removed.flavor;
        currentCulinarySum += added.flavor;
        currentUniqueKinds++; // Always increases by 1 as we replace a duplicate with a new kind

        // Update maximum enjoyment
        currentMaxEnjoyment = Math.max(currentMaxEnjoyment, currentUniqueKinds * currentUniqueKinds + currentCulinarySum);
    }

    console.log(currentMaxEnjoyment);
}
processFood(require("fs").readFileSync("/dev/stdin", "utf8"));