(function(rawInputText) {
    class DataStreamProcessor {
        constructor(sourceContent) {
            this.values = sourceContent.split('\n').filter(Boolean).map(Number);
            this.indexPointer = 0;
        }

        retrieveNextItem() {
            if (this.indexPointer < this.values.length) {
                return this.values[this.indexPointer++];
            }
            return null;
        }

        processSlice(elementList) {
            const determineOptimalSubsegment = (remainingElements, currentAccumulation, peakValueSoFar) => {
                if (remainingElements.length === 0) {
                    return peakValueSoFar;
                }

                const currentElement = remainingElements[0];
                const nextAccumulation = Math.max(currentElement, currentAccumulation + currentElement);
                const nextPeakValue = Math.max(peakValueSoFar, nextAccumulation);

                return determineOptimalSubsegment(remainingElements.slice(1), nextAccumulation, nextPeakValue);
            };

            if (elementList.length === 0) {
                return -Infinity;
            }

            const initialElement = elementList[0];
            const subsequentElements = elementList.slice(1);

            return determineOptimalSubsegment(subsequentElements, initialElement, initialElement);
        }

        handleAllSegments() {
            const outcomes = [];
            let segmentSize;
            while ((segmentSize = this.retrieveNextItem()) !== 0) {
                if (segmentSize === null) {
                    break;
                }

                const currentSegmentElements = [];
                for (let i = 0; i < segmentSize; i++) {
                    const item = this.retrieveNextItem();
                    if (item === null) {
                        break;
                    }
                    currentSegmentElements.push(item);
                }
                outcomes.push(this.processSlice(currentSegmentElements));
            }
            return outcomes;
        }
    }

    const streamProcessor = new DataStreamProcessor(rawInputText);
    const finalResults = streamProcessor.handleAllSegments();
    finalResults.forEach(res => console.log(res));
})(require('fs').readFileSync('/dev/stdin', 'utf8'));