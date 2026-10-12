function processInputData(rawData) {
  const lines = rawData.split("\n");

  const firstLineParts = lines[0].split(" ");
  const totalItems = Number.parseInt(firstLineParts[0], 10); // K
  const numTypes = Number.parseInt(firstLineParts[1], 10); // T (unused, but parsed for behavioral equivalence)

  const secondLineParts = lines[1].split(" ");
  const itemCounts = secondLineParts.map((elementValue, currentIndex) => {
    // Each element is an array: [original_index, count_value]
    return [currentIndex, Number.parseInt(elementValue, 10)];
  });

  let lastProcessedTypeIndex = -1; // Corresponds to 'last' in original
  let penaltyCount = 0; // Corresponds to 'count' in original
  let remainingItems = totalItems; // Corresponds to 'K' in original, renamed for clarity

  // Define constants for array indices to improve readability
  const TYPE_IDENTIFIER_INDEX = 0;
  const ITEM_QUANTITY_VALUE = 1;

  while (true) { // Equivalent to original 'while(1)'
    // Guard clause: If no items are left, output the penalty count and exit.
    if (remainingItems === 0) {
      return console.log(penaltyCount);
    }

    // Sort the item counts in descending order based on their quantity.
    // The original sort `a[1] < b[1]` effectively sorts in descending order of the second element.
    itemCounts.sort((itemA, itemB) => itemB[ITEM_QUANTITY_VALUE] - itemA[ITEM_QUANTITY_VALUE]);

    let itemProcessedInCurrentIteration = false; // Corresponds to 'found' in original

    // First attempt: Find an item that has a quantity greater than zero
    // AND whose type index is different from the last processed type.
    for (let idx = 0; idx < itemCounts.length; idx++) {
      const currentItemEntry = itemCounts[idx];
      const currentItemQuantity = currentItemEntry[ITEM_QUANTITY_VALUE];
      const currentItemType = currentItemEntry[TYPE_IDENTIFIER_INDEX];

      if (currentItemQuantity > 0 && currentItemType !== lastProcessedTypeIndex) {
        // Process the item: decrement its quantity, decrement total remaining items,
        // update the last processed type, and mark that an item was processed.
        currentItemEntry[ITEM_QUANTITY_VALUE]--;
        remainingItems--;
        lastProcessedTypeIndex = currentItemType;
        itemProcessedInCurrentIteration = true;
        break; // Exit this loop as an item has been successfully processed
      }
    }

    // If no suitable item was found in the first attempt (meaning all remaining items
    // are of the same type as the last processed one, or there are no items with quantity > 0
    // that are not the last processed type), then we must pick any available item
    // and incur a penalty.
    if (!itemProcessedInCurrentIteration) {
      // Second attempt: Find any item with a quantity greater than zero.
      for (let idx = 0; idx < itemCounts.length; idx++) {
        const currentItemEntry = itemCounts[idx];
        const currentItemQuantity = currentItemEntry[ITEM_QUANTITY_VALUE];
        const currentItemType = currentItemEntry[TYPE_IDENTIFIER_INDEX];

        if (currentItemQuantity > 0) {
          // Process the item: decrement its quantity, decrement total remaining items,
          // update the last processed type, and increment the penalty count.
          currentItemEntry[ITEM_QUANTITY_VALUE]--;
          remainingItems--;
          lastProcessedTypeIndex = currentItemType;
          penaltyCount++; // This is where the penalty is applied
          break; // Exit this loop as an item has been processed
        }
      }
    }
  }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
