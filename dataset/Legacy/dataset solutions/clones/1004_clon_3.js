function initializeAndSort(rawData) {
    const lines = rawData.split('\n');

    const elementCount = Number(lines.shift());
    const initialArray = lines.shift().split(' ', elementCount).map(Number);

    performBubbleSort(initialArray);
}

function performBubbleSort(targetArray) {
    let swapCounter = 0;
    let hasSwapped = true;

    const swapElements = (arr, idx1, idx2) => {
        const temporaryValue = arr[idx1];
        arr[idx1] = arr[idx2];
        arr[idx2] = temporaryValue;
    };

    while (hasSwapped) {
        hasSwapped = false;
        const lastIndexToConsider = targetArray.length - 1;
        for (let currentIdx = lastIndexToConsider; currentIdx >= 1; --currentIdx) {
            const previousIdx = currentIdx - 1;
            if (targetArray[currentIdx] < targetArray[previousIdx]) {
                swapElements(targetArray, currentIdx, previousIdx);
                hasSwapped = true;
                ++swapCounter;
            }
        }
    }
    console.log(targetArray.join(' '));
    console.log(swapCounter);
}

initializeAndSort(require('fs').readFileSync('/dev/stdin', 'utf8'));
