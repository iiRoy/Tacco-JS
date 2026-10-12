function processInputData(rawData) {
    const dataLines = rawData.split("\n");
    const elementCount = Number(dataLines[0]);
    const numericValues = dataLines[1].split(" ").map(Number);

    const classificationResult = numericValues.slice(0, elementCount).reduce((accumulator, currentVal) => {
        const categoryIdentifier = Math.floor(currentVal / 400);
        if (categoryIdentifier > 7) {
            accumulator.excessCount++;
        } else {
            accumulator.distinctCategories.add(categoryIdentifier);
        }
        return accumulator;
    }, { distinctCategories: new Set(), excessCount: 0 });

    const uniqueCategoryCount = classificationResult.distinctCategories.size;
    const totalCount = uniqueCategoryCount + classificationResult.excessCount;

    console.log(uniqueCategoryCount, totalCount);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
