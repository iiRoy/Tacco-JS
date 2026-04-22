const obtainInputData = () => {
    const rawContent = require('fs').readFileSync(0, 'utf8');
    const contentLines = rawContent.trim().split('\n');
    const elementCount = Number(contentLines[0]);
    const itemStrings = contentLines[1].split(' ');
    return { elementCount, itemStrings };
};

const acquiredData = obtainInputData();
const totalElements = acquiredData.elementCount;
const firstCollection = [...acquiredData.itemStrings];
const secondCollection = [...acquiredData.itemStrings];

const extractSortKey = (item) => {
    return parseInt(item.substring(1), 10);
};

const performStableArrangement = (targetList, listSize) => {
    const arrangeRecursively = (currentList, currentLength) => {
        if (currentLength <= 1) {
            return;
        }
        arrangeRecursively(currentList, currentLength - 1);
        let keyElement = currentList[currentLength - 1];
        let comparisonIndex = currentLength - 2;

        while (comparisonIndex >= 0 && extractSortKey(currentList[comparisonIndex]) > extractSortKey(keyElement)) {
            currentList[comparisonIndex + 1] = currentList[comparisonIndex];
            comparisonIndex--;
        }
        currentList[comparisonIndex + 1] = keyElement;
    };
    arrangeRecursively(targetList, listSize);
};

const performUnstableArrangement = (targetList, listSize) => {
    const swapItems = (list, pos1, pos2) => {
        [list[pos1], list[pos2]] = [list[pos2], list[pos1]];
    };

    const partitionElements = (list, lowPos, highPos) => {
        const pivotValue = extractSortKey(list[highPos]);
        let wallIndex = lowPos - 1;

        for (let currentPos = lowPos; currentPos < highPos; currentPos++) {
            if (extractSortKey(list[currentPos]) <= pivotValue) {
                wallIndex++;
                swapItems(list, wallIndex, currentPos);
            }
        }
        swapItems(list, wallIndex + 1, highPos);
        return wallIndex + 1;
    };

    const sortSublist = (list, lowPos, highPos) => {
        if (lowPos < highPos) {
            const pivotPoint = partitionElements(list, lowPos, highPos);
            sortSublist(list, lowPos, pivotPoint - 1);
            sortSublist(list, pivotPoint + 1, highPos);
        }
    };
    sortSublist(targetList, 0, listSize - 1);
};

performStableArrangement(firstCollection, totalElements);
console.log(firstCollection.join(' '));
console.log('Stable');

performUnstableArrangement(secondCollection, totalElements);
console.log(secondCollection.join(' '));

console.log((firstCollection.join(' ') === secondCollection.join(' ')) ? 'Stable' : 'Not stable');