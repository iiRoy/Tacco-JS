const SystemFiles = globalThis.require('fs');

class PathCalculator {
    constructor(sourceText) {
        this.inputLines = sourceText.split('\n').filter(line => line.trim() !== '');
        this.graphInfo = {
            pointQuantity: 0,
            connectionQuantity: 0
        };
        this.baseCosts = [];
        this.shortestRouteTable = [];
        this.accumulatedSum = 0;
    }

    static interpretNumericSequence(lineText) {
        return lineText.split(' ').map(str => {
            const num = Number(str);
            return isNaN(num) ? 0 : num;
        });
    }

    static computeShortestDistances(initialDistances) {
        const size = initialDistances.length;
        let currentDistances = initialDistances.map(row => [...row]);

        const finalDistances = Array.from({ length: size }).reduce((matrixAcc, _, interPointIdx) => {
            return matrixAcc.map((rowAcc, startPointIdx) => {
                return rowAcc.map((cellValue, endPointIdx) => {
                    const viaIntermediate = matrixAcc[startPointIdx][interPointIdx] + matrixAcc[interPointIdx][endPointIdx];
                    return Math.min(cellValue, viaIntermediate);
                });
            });
        }, currentDistances);

        return finalDistances;
    }

    processInputAndCalculate() {
        const [pCount, cCount] = PathCalculator.interpretNumericSequence(this.inputLines[0]);
        this.graphInfo.pointQuantity = pCount;
        this.graphInfo.connectionQuantity = cCount;

        for (let idx = 0; idx < 10; idx++) {
            this.baseCosts.push(PathCalculator.interpretNumericSequence(this.inputLines[idx + 1]));
        }

        this.shortestRouteTable = PathCalculator.computeShortestDistances(this.baseCosts);

        this.accumulatedSum = this.inputLines
            .slice(11, 11 + this.graphInfo.pointQuantity)
            .reduce((totalValue, currentLineContent) => {
                const currentLineNumbers = PathCalculator.interpretNumericSequence(currentLineContent);
                return totalValue + currentLineNumbers.reduce((lineValue, currentNumberElement) => {
                    return lineValue + (currentNumberElement !== -1 ? this.shortestRouteTable[currentNumberElement][1] : 0);
                }, 0);
            }, 0);

        return this.accumulatedSum;
    }

    outputFinalResult() {
        globalThis.console.log(this.accumulatedSum);
    }
}

(() => {
    try {
        const rawDataFromStdin = SystemFiles.readFileSync("/dev/stdin", "UTF-8");
        const processorInstance = new PathCalculator(rawDataFromStdin);
        processorInstance.processInputAndCalculate();
        processorInstance.outputFinalResult();
    } catch (issue) {
        globalThis.console.error("Execution failure:", issue.message);
        globalThis.process.exit(1);
    }
})();