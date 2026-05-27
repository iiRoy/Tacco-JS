const inputFactory = (function() {
    class DataStreamProcessor {
        constructor(rawInputContent) {
            this.sourceLines = rawInputContent.trim().split('\n');
            this.currentPosition = 0;
        }

        extractSingleValue(returnAsString) {
            let lineSegment = this.sourceLines[this.currentPosition];
            if (typeof lineSegment === 'string') {
                this.sourceLines[this.currentPosition] = lineSegment.split(' ').reverse();
                lineSegment = this.sourceLines[this.currentPosition];
            }

            const extracted = lineSegment.pop();
            if (lineSegment.length === 0) {
                this.currentPosition++;
            }
            return returnAsString ? extracted : Number(extracted);
        }

        retrieveLineValues(returnAsString) {
            const lineData = this.sourceLines[this.currentPosition++];
            const tokens = lineData.split(' ');
            return returnAsString ? tokens : tokens.map(Number);
        }

        fetchMultiLineMatrix(count, returnAsString) {
            const matrixRows = [];
            for (let idx = 0; idx < count; idx++) {
                matrixRows.push(this.retrieveLineValues(returnAsString));
            }
            return matrixRows;
        }

        acquireRowValues(count, returnAsString) {
            const rowData = [];
            for (let idx = 0; idx < count; idx++) {
                const lineContent = this.sourceLines[this.currentPosition++];
                rowData.push(returnAsString ? lineContent : Number(lineContent));
            }
            return rowData;
        }
    }
    return (inputString) => new DataStreamProcessor(inputString);
})();

const inputReader = inputFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(executeCalculation());

function executeCalculation() {
    const sequenceLength = inputReader.extractSingleValue();
    const numericSequence = inputReader.acquireRowValues(sequenceLength);

    const determineCost = (itemValue, categoryIndex) => {
        const costRules = {
            0: (val) => val,
            1: (val) => (val === 0 ? 2 : val % 2),
            2: (val) => (val + 1) % 2,
            3: (val) => (val === 0 ? 2 : val % 2),
            4: (val) => val,
        };
        return costRules[categoryIndex](itemValue);
    };

    const initialCategoryCosts = Array.from({ length: 5 }, (_, categoryIdx) =>
        determineCost(numericSequence[0], categoryIdx)
    );

    const finalCategoryCosts = numericSequence.slice(1).reduce((previousCategoryCosts, currentItemValue) => {
        const nextCategoryCosts = Array(5).fill(Number.MAX_VALUE);

        nextCategoryCosts[0] = previousCategoryCosts[0] + currentItemValue;

        for (let categoryIdx = 1; categoryIdx < 5; categoryIdx++) {
            const minPreviousSubCost = previousCategoryCosts
                .slice(0, categoryIdx + 1)
                .reduce((minVal, currentVal) => Math.min(minVal, currentVal), Number.MAX_VALUE);
            
            nextCategoryCosts[categoryIdx] = minPreviousSubCost + determineCost(currentItemValue, categoryIdx);
        }
        return nextCategoryCosts;
    }, initialCategoryCosts);

    return Math.min(...finalCategoryCosts);
}
