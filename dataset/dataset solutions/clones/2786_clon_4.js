'use strict';
(function(rawInputData) {
    const dataSegments = rawInputData.split('\n');
    const elementCount = Number(dataSegments[0].trim());
    const numberSequenceText = dataSegments[1].trim();

    const numericValues = numberSequenceText.split(/\s+/).map(Number);

    function locateNthSmallest(targetArray, desiredRank) {
        if (desiredRank < 0 || desiredRank >= targetArray.length) {
            throw new Error("Desired rank out of bounds for selection.");
        }

        function divideAndConquer(workingList, leftBound, rightBound, pivotPosition) {
            const pivotValue = workingList[pivotPosition];
            [workingList[pivotPosition], workingList[rightBound]] = [workingList[rightBound], workingList[pivotPosition]];
            let swapIndex = leftBound;
            for (let i = leftBound; i < rightBound; i++) {
                if (workingList[i] < pivotValue) {
                    [workingList[swapIndex], workingList[i]] = [workingList[i], workingList[swapIndex]];
                    swapIndex++;
                }
            }
            [workingList[rightBound], workingList[swapIndex]] = [workingList[swapIndex], workingList[rightBound]];
            return swapIndex;
        }

        function recursiveSearch(workingList, leftBound, rightBound, targetRank) {
            if (leftBound === rightBound) {
                return workingList[leftBound];
            }

            let currentPivotIndex = Math.floor(Math.random() * (rightBound - leftBound + 1)) + leftBound;
            currentPivotIndex = divideAndConquer(workingList, leftBound, rightBound, currentPivotIndex);

            if (targetRank === currentPivotIndex) {
                return workingList[targetRank];
            } else if (targetRank < currentPivotIndex) {
                return recursiveSearch(workingList, leftBound, currentPivotIndex - 1, targetRank);
            } else {
                return recursiveSearch(workingList, currentPivotIndex + 1, rightBound, targetRank);
            }
        }
        
        const tempArrayForSearch = [...targetArray];
        return recursiveSearch(tempArrayForSearch, 0, tempArrayForSearch.length - 1, desiredRank);
    }

    const firstMiddleRank = (elementCount / 2) - 1;
    const secondMiddleRank = (elementCount / 2);

    const firstMiddleValue = locateNthSmallest(numericValues, firstMiddleRank);
    const secondMiddleValue = locateNthSmallest(numericValues, secondMiddleRank);

    console.log(secondMiddleValue - firstMiddleValue);

})(require('fs').readFileSync('/dev/stdin','utf8'));
