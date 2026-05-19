function main(inputTxt) {
    const inputLines = inputTxt.split('\n');
    const numberStrings = inputLines[1].split(' ');
    const numericItems = numberStrings.map(Number);

    const itemCounts = new Map();
    for (const itemValue of numericItems) {
        itemCounts.set(itemValue, (itemCounts.get(itemValue) || 0) + 1);
    }

    const potentialRectangleSides = [];
    for (const [valueKey, occurrenceCount] of itemCounts.entries()) {
        const availablePairs = Math.floor(occurrenceCount / 2);
        for (let pairIndex = 0; pairIndex < availablePairs; pairIndex++) {
            potentialRectangleSides.push(valueKey);
        }
    }

    potentialRectangleSides.sort((first, second) => second - first);

    let finalProduct = 0;
    if (potentialRectangleSides.length >= 2) {
        finalProduct = potentialRectangleSides[0] * potentialRectangleSides[1];
    }

    console.log(finalProduct);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
