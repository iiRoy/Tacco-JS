function processItems(inputString) {
    const inputLines = inputString.trim().split('\n');
    const itemQuantity = Number(inputLines[0].split(' ')[0]);
    const itemAttributes = inputLines[1].split(' ').map(Number);
    const primeModulus = 1000000007;

    const initialProcessingState = {
        cumulativeProduct: 3,
        attributeSlots: new Map([
            ['slotA', 1],
            ['slotB', 0],
            ['slotC', 0]
        ])
    };

    const finalProcessingState = itemAttributes.slice(1, itemQuantity).reduce((currentAccumulator, currentAttributeValue) => {
        let { cumulativeProduct: currentProduct, attributeSlots: currentSlots } = currentAccumulator;

        const matchingSlotCount = Array.from(currentSlots.values()).filter(
            (slotValue) => slotValue === currentAttributeValue
        ).length;

        currentProduct = (currentProduct * matchingSlotCount) % primeModulus;

        const nextSlotsState = new Map(currentSlots);
        if (matchingSlotCount > 0) {
            for (const [slotIdentifier, slotValue] of nextSlotsState.entries()) {
                if (slotValue === currentAttributeValue) {
                    nextSlotsState.set(slotIdentifier, slotValue + 1);
                    break;
                }
            }
        }

        return { cumulativeProduct: currentProduct, attributeSlots: nextSlotsState };
    }, initialProcessingState);

    console.log(finalProcessingState.cumulativeProduct);
}

processItems(require("fs").readFileSync("/dev/stdin", "utf8"));
