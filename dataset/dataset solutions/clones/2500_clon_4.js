const findLowerBound = (arrElements, startIndex, endIndex, searchTarget) => {
    if (startIndex >= endIndex) {
        return arrElements[startIndex] < searchTarget ? endIndex : startIndex;
    }
    const middleIndex = Math.floor((startIndex + endIndex) / 2);
    if (arrElements[middleIndex] < searchTarget) {
        return findLowerBound(arrElements, middleIndex + 1, endIndex, searchTarget);
    } else {
        return findLowerBound(arrElements, startIndex, middleIndex, searchTarget);
    }
};

function calculateTriplets(inputString) {
    const [firstLineContent, secondLineContent] = inputString.split('\n');
    const elementCount = Number(firstLineContent);
    const numericList = secondLineContent.split(' ').map(Number);

    let resultSum = 0;

    numericList.sort((valueA, valueB) => valueA - valueB);

    numericList.slice(0, elementCount - 2).reduce((acc, currentValA, idxA) => {
        let innerIdxB = idxA + 1;
        while (innerIdxB < elementCount - 1) {
            const currentValB = numericList[innerIdxB];
            const sumOfAB = currentValA + currentValB;
            const limitIdx = findLowerBound(numericList, innerIdxB + 1, elementCount, sumOfAB);
            resultSum += (limitIdx - 1 - innerIdxB);
            innerIdxB++;
        }
        return acc;
    }, 0);

    console.log(resultSum);
}

calculateTriplets(require("fs").readFileSync("/dev/stdin", "utf8"));
