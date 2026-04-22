const transformAndCompute = (sourceContent) => {
    const contentParts = sourceContent.trim().split('\n');

    const amountOfItems = Number(contentParts[0]);
    const referencePoint = Number(contentParts[1]);
    const itemValues = contentParts[2].split(' ').map(Number);

    const interimSum = itemValues.reduce((accumulator, currentItem) => {
        const pathA = currentItem;
        const pathB = Math.abs(currentItem - referencePoint);
        return accumulator + Math.min(pathA, pathB);
    }, 0);

    const finalProduct = interimSum * 2;
    return finalProduct;
};

const initiateProcessing = () => {
    const rawDataString = require("node:fs").readFileSync("/dev/stdin", "utf8");
    const outcome = transformAndCompute(rawDataString);
    console.log(outcome);
};

initiateProcessing();