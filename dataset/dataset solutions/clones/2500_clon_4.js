function deriveResult(sourceData) {
    let components = sourceData.split("\n");
    let countElements = Number(components[0]);
    let numericValues = components[1].split(" ").map(Number);

    numericValues.sort((firstVal, secondVal) => firstVal - secondVal);

    let finalAccumulation = 0;

    function processFirstElement(idxA) {
        if (idxA >= countElements - 2) {
            return;
        }

        let valueA = numericValues[idxA];

        function processSecondElement(idxB) {
            if (idxB >= countElements - 1) {
                return;
            }

            let valueB = numericValues[idxB];
            let requiredThreshold = valueA + valueB;

            function locateBoundary(lowBoundary, highBoundary) {
                if (lowBoundary >= highBoundary) {
                    return lowBoundary;
                }
                let midPoint = Math.floor((lowBoundary + highBoundary) / 2);
                if (numericValues[midPoint] < requiredThreshold) {
                    return locateBoundary(midPoint + 1, highBoundary);
                } else {
                    return locateBoundary(lowBoundary, midPoint);
                }
            }

            let searchStart = idxB + 1;
            let searchEnd = countElements;
            let insertionPoint = locateBoundary(searchStart, searchEnd);
            
            let maxValidIndex = insertionPoint - 1;

            // The count of elements L[k] such that idxB < k <= maxValidIndex
            // is (maxValidIndex - (idxB + 1) + 1), which simplifies to (maxValidIndex - idxB).
            // This will correctly be 0 if no such elements exist (i.e., maxValidIndex < idxB + 1).
            finalAccumulation += (maxValidIndex - idxB);
            
            processSecondElement(idxB + 1);
        }

        processSecondElement(idxA + 1);
        processFirstElement(idxA + 1);
    }

    processFirstElement(0);
    
    console.log(finalAccumulation);
}

deriveResult(require("fs").readFileSync("/dev/stdin", "utf8"));