function processSequence(inputData) {
    const MOD_CONSTANT = 1000000007n;

    const [firstLine, secondLine] = inputData.split('\n');
    const [sequenceLength, repetitionFactor] = firstLine.split(' ').map(Number);
    const initialSequence = secondLine.split(' ').map(Number);

    const isUniform = initialSequence.every((val, idx, arr) => idx === 0 || val === arr[idx - 1]);
    if (isUniform) {
        console.log("0");
        return;
    }

    function calculateInversions(dataArray) {
        let totalInversions = 0n;

        function mergeAndCount(leftHalf, rightHalf) {
            let mergedResult = [];
            let leftIndex = 0;
            let rightIndex = 0;

            while (leftIndex < leftHalf.length && rightIndex < rightHalf.length) {
                if (leftHalf[leftIndex] <= rightHalf[rightIndex]) {
                    mergedResult.push(leftHalf[leftIndex++]);
                } else {
                    mergedResult.push(rightHalf[rightIndex++]);
                    totalInversions += BigInt(leftHalf.length - leftIndex);
                }
            }

            while (leftIndex < leftHalf.length) {
                mergedResult.push(leftHalf[leftIndex++]);
            }
            while (rightIndex < rightHalf.length) {
                mergedResult.push(rightHalf[rightIndex++]);
            }
            return mergedResult;
        }

        function divideAndConquer(segment) {
            if (segment.length <= 1) {
                return segment;
            }
            const midPoint = Math.floor(segment.length / 2);
            const leftSorted = divideAndConquer(segment.slice(0, midPoint));
            const rightSorted = divideAndConquer(segment.slice(midPoint));
            return mergeAndCount(leftSorted, rightSorted);
        }

        divideAndConquer([...dataArray]);
        return totalInversions;
    }

    const inversionsForSingle = calculateInversions(initialSequence);
    const inversionsForDouble = (3n * inversionsForSingle);

    if (repetitionFactor === 1) {
        console.log(String(inversionsForSingle));
    } else if (repetitionFactor === 2) {
        console.log(String(inversionsForDouble));
    } else {
        let currentValues = [inversionsForSingle, inversionsForDouble];
        let currentRepetition = 2;

        while (currentRepetition < repetitionFactor) {
            const nextTerm = currentValues[0] + currentValues[1] + currentValues[1];
            currentValues = [currentValues[1], nextTerm];
            currentRepetition++;
        }
        console.log(String(currentValues[1] % MOD_CONSTANT));
    }
}

processSequence(require("fs").readFileSync("/dev/stdin", "utf8"));
