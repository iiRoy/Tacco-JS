function insertSorted(sortedArray, element) {
    if (sortedArray.length === 0) {
        return [element];
    }

    function findInsertIndex(arr, val, start, end) {
        if (start > end) {
            return start;
        }
        const mid = Math.floor((start + end) / 2);
        if (arr[mid] === val) {
            return mid;
        } else if (arr[mid] < val) {
            return findInsertIndex(arr, val, mid + 1, end);
        } else {
            return findInsertIndex(arr, val, start, mid - 1);
        }
    }

    const insertionPoint = findInsertIndex(sortedArray, element, 0, sortedArray.length - 1);
    return [...sortedArray.slice(0, insertionPoint), element, ...sortedArray.slice(insertionPoint)];
}

function processNumbers(currentSortedNumbers) {
    if (currentSortedNumbers.length === 1) {
        return currentSortedNumbers[0];
    }

    const firstVal = currentSortedNumbers[0];
    const secondVal = currentSortedNumbers[1];
    const computedAverage = (firstVal + secondVal) / 2;

    const remainingElements = currentSortedNumbers.slice(2);

    const nextSortedNumbers = insertSorted(remainingElements, computedAverage);

    return processNumbers(nextSortedNumbers);
}

function EntryPoint(rawInput) {
    const inputLines = rawInput.split("\n");
    const initialNumbers = inputLines[1].split(" ").map(Number);
    initialNumbers.sort((a, b) => a - b);

    const finalResult = processNumbers(initialNumbers);
    console.log(finalResult);
}

EntryPoint(require("fs").readFileSync("/dev/stdin", "utf8").trim());
