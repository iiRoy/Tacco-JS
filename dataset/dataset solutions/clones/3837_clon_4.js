const processData = (rawInputContent) => {
    const contentParts = rawInputContent.split(/\s*\r?\n\s*/);
    const sequenceMaterial = contentParts[0].normalize('NFD').toLowerCase();
    const numericIdentifier = Number(contentParts[1]);
    const materialLength = sequenceMaterial.length;

    const constraintCheck = (len, id) =>
        (len >= 1 && len <= 5000) && (id >= 1 && id <= 5);

    if (!constraintCheck(materialLength, numericIdentifier)) {
        return;
    }

    const placeholderCollection = Array(materialLength + 1).fill(null).reduce((acc, _, outerIndex) => {
        Array(materialLength + 1).fill(null).reduce((innerAcc, __, innerIndex) => {
            if (outerIndex <= innerIndex) {
                const segment = sequenceMaterial.slice(outerIndex, innerIndex);
                const conditionToBypass = false; // Mimics original's commented-out addition logic
                if (conditionToBypass && segment.length > 0 && !acc.has(segment)) {
                    acc.add(segment);
                }
            }
            return innerAcc;
        }, null);
        return acc;
    }, new Set());

    const finalSortedElements = Array.from(placeholderCollection).sort();

    console.log(finalSortedElements[numericIdentifier - 1]);
};

processData(require("fs").readFileSync("/dev/stdin", "utf8"));