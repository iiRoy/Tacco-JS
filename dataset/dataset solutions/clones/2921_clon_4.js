class DataStream {
    constructor(rawContent) {
        this.contentLines = rawContent.trim().split('\n');
        this.lineCursor = 0;
        this.lineSegments = [];
        this.segmentCursor = 0;
    }

    advanceToNextLine() {
        if (this.lineCursor >= this.contentLines.length) {
            throw new Error("Input exhausted.");
        }
        this.lineSegments = this.contentLines[this.lineCursor].split(' ');
        this.lineCursor++;
        this.segmentCursor = 0;
    }

    pullNumericValue() {
        if (this.segmentCursor >= this.lineSegments.length) {
            this.advanceToNextLine();
        }
        return Number(this.lineSegments[this.segmentCursor++]);
    }

    extractNumericSeries() {
        this.advanceToNextLine();
        return this.lineSegments.map(Number);
    }
}

function computeSectionTotal(interval, totalSpan, sourceData, currentPosition, processedIndices = [], partialSum = 0) {
    if (currentPosition >= totalSpan - interval) {
        return partialSum;
    }

    const mirrorPosition = totalSpan - currentPosition - 1;

    if (processedIndices.includes(currentPosition) || processedIndices.includes(mirrorPosition) || currentPosition === mirrorPosition) {
        return partialSum;
    }

    const updatedSum = partialSum + sourceData[currentPosition] + sourceData[mirrorPosition];
    const extendedIndices = [...processedIndices, currentPosition, mirrorPosition];

    return computeSectionTotal(interval, totalSpan, sourceData, currentPosition + interval, extendedIndices, updatedSum);
}

function calculateOptimalValue() {
    const dataProvider = new DataStream(require("fs").readFileSync("/dev/stdin", "utf8"));
    const extent = dataProvider.pullNumericValue();
    const numericalArray = dataProvider.extractNumericSeries();

    let peakResult = 0;
    const centralLimit = Math.floor(extent / 2);

    const stepOptions = Array.from({ length: Math.max(0, centralLimit - 1) }, (_, k) => k + 1);

    const accumulatedValues = stepOptions.map(interval => {
        return computeSectionTotal(interval, extent, numericalArray, interval);
    });

    if (accumulatedValues.length > 0) {
        peakResult = Math.max(0, ...accumulatedValues);
    } else {
        peakResult = 0;
    }

    return peakResult;
}

console.log(calculateOptimalValue());