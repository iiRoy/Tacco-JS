(function(scopeRef, creatorFn) {
  if (typeof define === 'function' && define.amd) {
    define([], function() {
      return creatorFn(scopeRef);
    });
  } else if (typeof module === 'object' && module.exports) {
    module.exports = creatorFn(scopeRef);
  } else {
    scopeRef.StrDistCalculator = creatorFn(scopeRef);
  }
}(this, function(globalContext) {

  class StrDistCalculator {
    #resultantMatrix;
    #computedMetric;

    constructor(firstSequence, secondSequence) {
      if (firstSequence === secondSequence) {
        this.#computedMetric = 0;
        return;
      }
      if (firstSequence.length === 0) {
        this.#computedMetric = secondSequence.length;
        return;
      }
      if (secondSequence.length === 0) {
        this.#computedMetric = firstSequence.length;
        return;
      }

      const rowCount = firstSequence.length + 1;
      const colCount = secondSequence.length + 1;

      let priorRow = Array.from({ length: colCount }, (_, idx) => idx);
      const entireChart = [priorRow.slice()];

      for (let rIdx = 1; rIdx < rowCount; rIdx++) {
        let currentRow = Array(colCount);
        currentRow[0] = rIdx;

        for (let cIdx = 1; cIdx < colCount; cIdx++) {
          const costOfChange = (firstSequence[rIdx - 1] === secondSequence[cIdx - 1]) ? 0 : 1;
          currentRow[cIdx] = Math.min(
            priorRow[cIdx] + 1,
            currentRow[cIdx - 1] + 1,
            priorRow[cIdx - 1] + costOfChange
          );
        }
        priorRow = currentRow;
        entireChart.push(currentRow.slice());
      }

      this.#resultantMatrix = entireChart;
      this.#computedMetric = priorRow[colCount - 1];
    }

    getNumericMetric() {
      return this.#computedMetric;
    }

    retrieveDataChart() {
      return this.#resultantMatrix.map(line => line.slice());
    }

    presentDataChart(suppressOutput) {
      const displayData = this.retrieveDataChart();
      if (!displayData || displayData.length === 0) return "";

      const maximumValue = displayData.reduce((currentMax, dataLine) =>
        Math.max(currentMax, dataLine.reduce((lineMax, cellData) => Math.max(lineMax, cellData), 0))
      , 0);

      const fieldWidth = (maximumValue + '').length;
      const spacingText = ' '.repeat(fieldWidth);

      const horizontalSeparator = displayData[0].map(() => '-'.repeat(fieldWidth)).join('-+-') + '-';

      const formattedLines = displayData.map(dataLine => {
        const lineCells = dataLine.map(cellData => (spacingText + cellData).slice(-fieldWidth));
        return lineCells.join(' | ') + ' ';
      });

      return formattedLines.join('\n' + horizontalSeparator + '\n');
    }

    valueIdentifier() {
      return this.getNumericMetric();
    }
  }

  StrDistCalculator.prototype.diagnosticView = StrDistCalculator.prototype.presentDataChart;

  return StrDistCalculator;

}));