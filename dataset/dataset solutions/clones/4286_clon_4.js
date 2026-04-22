const operationHandler = (sourceMaterial) => {
    const separatorPosition = sourceMaterial.indexOf('\n');
    const firstLineContent = sourceMaterial.substring(0, separatorPosition);
    const subsequentLinesContent = sourceMaterial.substring(separatorPosition + 1);

    const primaryExponent = parseInt(firstLineContent, 10);

    const numericCollection = (subsequentLinesContent.match(/\d+/g) || []).map(Number);

    const initialMagnitude = 3 ** primaryExponent;

    const secondaryFactor = numericCollection.reduce((acc, currentNum) => {
        if ((currentNum & 1) === 0) {
            return acc * 2;
        }
        return acc;
    }, 1);

    console.log(initialMagnitude - secondaryFactor);
};

operationHandler(require("fs").readFileSync("/dev/stdin", "utf8").trim());