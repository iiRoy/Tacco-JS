const obtainResourceData = (filePath, encoding) => require("fs").readFileSync(filePath, encoding);

const performAnalysis = (sourceData) => {
    const extractedNumerics = sourceData.match(/-?\d+/g).slice(1);
    const convertedValues = extractedNumerics.map(Number);

    const occurrenceRegister = convertedValues.reduce((acc, currentNum) => {
        acc[currentNum] = (acc[currentNum] || 0) + 1;
        return acc;
    }, {});

    const matchingElements = [];
    const sortedKeys = Object.keys(occurrenceRegister).map(Number).sort((valA, valB) => valB - valA);

    for (const currentKey of sortedKeys) {
        let currentCount = occurrenceRegister[currentKey];
        while (currentCount >= 2 && matchingElements.length < 2) {
            matchingElements.push(currentKey);
            currentCount -= 2;
        }
        if (matchingElements.length === 2) {
            break;
        }
    }

    const finalProduct = (matchingElements[0] || 0) * (matchingElements[1] || 0);
    console.log(finalProduct);
};

performAnalysis(obtainResourceData("/dev/stdin", "utf8"));