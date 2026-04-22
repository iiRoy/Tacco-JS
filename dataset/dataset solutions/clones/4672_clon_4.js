let entireInput = '';

process.stdin.on('readable', () => {
    let piece;
    while ((piece = process.stdin.read()) !== null) {
        entireInput += piece;
    }
});

process.stdin.on('end', () => {
    class CalculationEngine {
        constructor(rawInput) {
            const linesSeparated = rawInput.trim().split('\n');
            const initialParameters = linesSeparated[0].split(' ');
            this.totalAmount = parseInt(initialParameters[0], 10);
            this.minAmountToPick = parseInt(initialParameters[1], 10);
            this.maxAmountToPick = parseInt(initialParameters[2], 10);

            this.numericSequence = linesSeparated[1].split(' ').map(Number);
            this.numericSequence = this.sortDescendingValues(this.numericSequence); 
            
            this.valueOccurrences = new Map();
            this.numericSequence.forEach(item => {
                this.valueOccurrences.set(item, (this.valueOccurrences.get(item) || 0) + 1);
            });
        }

        // Custom Merge Sort for descending order
        mergeSegments(leftSegment, rightSegment) {
            const finalSorted = [];
            let leftPointer = 0;
            let rightPointer = 0;

            while (leftPointer < leftSegment.length && rightPointer < rightSegment.length) {
                if (leftSegment[leftPointer] >= rightSegment[rightPointer]) {
                    finalSorted.push(leftSegment[leftPointer]);
                    leftPointer++;
                } else {
                    finalSorted.push(rightSegment[rightPointer]);
                    rightPointer++;
                }
            }
            return finalSorted.concat(leftSegment.slice(leftPointer)).concat(rightSegment.slice(rightPointer));
        }

        sortDescendingValues(collection) {
            if (collection.length <= 1) {
                return collection;
            }
            const midPoint = Math.floor(collection.length / 2);
            const leftHalf = collection.slice(0, midPoint);
            const rightHalf = collection.slice(midPoint);

            return this.mergeSegments(this.sortDescendingValues(leftHalf), this.sortDescendingValues(rightHalf));
        }

        determineHighestAverage() {
            const sumFirstSelected = this.numericSequence.slice(0, this.minAmountToPick).reduce((accumulator, currentVal) => accumulator + currentVal, 0);
            return sumFirstSelected / this.minAmountToPick;
        }

        // Static memoized factorial function
        static factorialMemo = new Map();
        static computeFactorial(val) {
            if (val < 0) return 0;
            if (val === 0 || val === 1) return 1;
            if (CalculationEngine.factorialMemo.has(val)) return CalculationEngine.factorialMemo.get(val);
            const outcome = val * CalculationEngine.computeFactorial(val - 1);
            CalculationEngine.factorialMemo.set(val, outcome);
            return outcome;
        }

        // Combination function (nCk)
        combinations(totalAvailable, itemsToChoose) {
            if (itemsToChoose < 0 || itemsToChoose > totalAvailable) return 0;
            if (itemsToChoose === 0 || itemsToChoose === totalAvailable) return 1;
            if (itemsToChoose > totalAvailable / 2) itemsToChoose = totalAvailable - itemsToChoose; 
            return CalculationEngine.computeFactorial(totalAvailable) / (CalculationEngine.computeFactorial(itemsToChoose) * CalculationEngine.computeFactorial(totalAvailable - itemsToChoose));
        }

        countPossibleSelections() {
            let numWays = 0;

            if (this.numericSequence[0] !== this.numericSequence[this.maxAmountToPick - 1]) {
                const thresholdValue = this.numericSequence[this.minAmountToPick - 1];
                let countSuperiorValues = 0;
                for (let i = 0; i < this.numericSequence.length; i++) {
                    if (this.numericSequence[i] > thresholdValue) {
                        countSuperiorValues++;
                    } else {
                        break; 
                    }
                }

                const requiredFromThreshold = this.minAmountToPick - countSuperiorValues;
                const totalThresholdOccurrences = this.valueOccurrences.get(thresholdValue);
                numWays = this.combinations(totalThresholdOccurrences, requiredFromThreshold);

            } else {
                // All values from numericSequence[0] to numericSequence[maxAmountToPick-1] are identical.
                // The original code computes 2^B - 1 in this specific case.
                numWays = Math.pow(2, this.maxAmountToPick) - 1;
            }
            return numWays;
        }
    }

    const problemInstance = new CalculationEngine(entireInput);
    console.log(problemInstance.determineHighestAverage());
    console.log(problemInstance.countPossibleSelections());
});