const reader = require('readline').createInterface({
    input: process.stdin
});

let collectedLines = [];

reader.on('line', (currentLine) => {
    collectedLines.push(currentLine.trim());
});

reader.on('close', () => {
    const numericElements = collectedLines[1].split(' ').map(s => Number(s));

    class DataProcessor {
        constructor(initialElements) {
            this.dataElements = [...initialElements];
            this.exchangeCount = 0;
        }

        processSegment(currentPosition) {
            if (currentPosition >= this.dataElements.length - 1) {
                return;
            }

            let smallestElementPosition = this.locateSmallest(currentPosition, currentPosition + 1, currentPosition);

            if (this.dataElements[currentPosition] !== this.dataElements[smallestElementPosition]) {
                const temp = this.dataElements[currentPosition];
                this.dataElements[currentPosition] = this.dataElements[smallestElementPosition];
                this.dataElements[smallestElementPosition] = temp;
                this.exchangeCount++;
            }

            this.processSegment(currentPosition + 1);
        }

        locateSmallest(startIndex, currentCheckPosition, bestSoFarIndex) {
            if (currentCheckPosition >= this.dataElements.length) {
                return bestSoFarIndex;
            }

            let newBestIndex = bestSoFarIndex;
            if (this.dataElements[currentCheckPosition] < this.dataElements[bestSoFarIndex]) {
                 newBestIndex = currentCheckPosition;
            }

            return this.locateSmallest(startIndex, currentCheckPosition + 1, newBestIndex);
        }

        executeSorting() {
            this.processSegment(0);
            return {
                orderedSequence: this.dataElements,
                totalExchanges: this.exchangeCount
            };
        }
    }

    const sorterInstance = new DataProcessor(numericElements);
    const result = sorterInstance.executeSorting();

    process.stdout.write(result.orderedSequence.join(' ') + '\n');
    process.stdout.write(result.totalExchanges + '\n');
});