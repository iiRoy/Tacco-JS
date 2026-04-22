const dataSourceText = require('fs').readFileSync('/dev/stdin', 'utf8');

const parseInitialConfig = (sourceContent) => {
    const contentLines = sourceContent.trim().split('\n');
    const configLine = contentLines.shift();
    const configValues = configLine.split(' ').map(Number);
    const [dimensionSize, elementCount, focalPoint] = configValues;
    const itemValues = contentLines.map(Number);
    return { dimensionSize, focalPoint, itemValues };
};

const { dimensionSize, focalPoint, itemValues } = parseInitialConfig(dataSourceText);

const prepareTargetCollection = (mainPoint, currentItems) => {
    const filteredItems = currentItems.filter(item => item !== mainPoint);
    filteredItems.push(mainPoint);
    return filteredItems.sort((a, b) => a - b);
};

const targetCollection = prepareTargetCollection(focalPoint, itemValues);

const determineMinimumPath = (sizeN, pivotP, collection) => {
    const pathOptions = [];
    const pivotIndex = collection.indexOf(pivotP);
    const collectionLength = collection.length;

    // Generate costs for elements to the left of pivotP (original 'v < p' branch)
    // This covers elements at indices 1 up to pivotIndex - 1.
    // Original: `if(v<p){ if(i!=0)min=Math.min(min,(p-v)*2+(n-p+1)+ary[i-1]); }`
    collection.slice(1, pivotIndex).forEach((currentVal, offsetIdx) => {
        const originalIdx = offsetIdx + 1; // currentVal corresponds to collection[originalIdx]
        const previousVal = collection[originalIdx - 1];
        pathOptions.push(
            (pivotP - currentVal) * 2 + (sizeN - pivotP + 1) + previousVal
        );
    });

    // Generate costs when current element is pivotP (original 'p == v' branch)
    // These conditions are evaluated independently in the original code.
    if (pivotIndex === 0) { // Corresponds to original `i==0`
        pathOptions.push(collection[collectionLength - 1] - pivotP);
    }
    if (pivotIndex === collectionLength - 1) { // Corresponds to original `i==ary.length-1`
        pathOptions.push(pivotP - collection[0]);
    }
    if (pivotIndex < collectionLength - 1) { // Corresponds to original `i!=ary.length-1`
        pathOptions.push(pivotP + sizeN - collection[pivotIndex + 1] + 1);
    }
    if (pivotIndex > 0) { // Corresponds to original `i!=0`
        pathOptions.push(sizeN - pivotP + 1 + collection[pivotIndex - 1]);
    }

    // Generate costs for elements to the right of pivotP (original 'p < v' branch)
    // This covers elements at indices pivotIndex + 1 up to collectionLength - 2.
    // Original: `if(p<v){ if(i!=ary.length-1)min=Math.min(min,(v-p)*2+p+(n-ary[i+1]+1)); }`
    collection.slice(pivotIndex + 1, collectionLength - 1).forEach((currentVal, offsetIdx) => {
        const originalIdx = offsetIdx + pivotIndex + 1; // currentVal corresponds to collection[originalIdx]
        const nextVal = collection[originalIdx + 1];
        pathOptions.push(
            (currentVal - pivotP) * 2 + pivotP + (sizeN - nextVal + 1)
        );
    });

    return pathOptions.length > 0 ? Math.min(...pathOptions) : Infinity;
};

const finalResult = determineMinimumPath(dimensionSize, focalPoint, targetCollection);

console.log(finalResult * 100);