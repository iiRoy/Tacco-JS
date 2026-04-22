const acquireData = (() => {
    class InputProcessor {
        constructor(textInput) {
            this.sourceLines = textInput.trim().split("\n");
            this.currentLineIndex = 0;
        }

        extractItem(returnAsString = false) {
            let lineContent = this.sourceLines[this.currentLineIndex];
            if (typeof lineContent === "string") {
                this.sourceLines[this.currentLineIndex] = lineContent.split(" ").reverse();
            }
            let retrievedItem = this.sourceLines[this.currentLineIndex].pop();
            if (this.sourceLines[this.currentLineIndex].length === 0) {
                this.currentLineIndex++;
            }
            return returnAsString ? retrievedItem : Number(retrievedItem);
        }

        retrieveLineItems(returnAsStrings = false) {
            let items = this.sourceLines[this.currentLineIndex++].split(" ");
            return returnAsStrings ? items : items.map(Number);
        }

        obtainMatrix(count, returnAsStrings = false) {
            let segment = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + count);
            this.currentLineIndex += count;
            let outcome = segment.map(line => line.split(" "));
            return returnAsStrings ? outcome : outcome.map(row => row.map(Number));
        }

        fetchRows(count, returnAsStrings = false) {
            let segment = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + count);
            this.currentLineIndex += count;
            return returnAsStrings ? segment : segment.map(Number);
        }
    }

    return (rawData) => new InputProcessor(rawData);
})();

const source = acquireData(require("node:fs").readFileSync("/dev/stdin", "utf8"));

const buildNestedArray = (initialValue, ...dimensions) => {
    if (dimensions.length === 0) {
        return initialValue;
    }
    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);
    return Array.from({ length: currentDimensionSize }, () =>
        buildNestedArray(initialValue, ...remainingDimensions)
    );
};

const calculateMaxConcurrency = () => {
    const totalEvents = source.extractItem();
    const totalChannels = source.extractItem();

    const { perChannelEvents, overallMaxTime } = Array.from({ length: totalEvents }).reduce(
        ({ perChannelEvents, overallMaxTime }, _, eventIdx) => {
            const [startMoment, endMoment, channelId] = source.retrieveLineItems();
            perChannelEvents[channelId - 1].push([startMoment, endMoment]);
            return {
                perChannelEvents: perChannelEvents,
                overallMaxTime: Math.max(overallMaxTime, endMoment)
            };
        },
        {
            perChannelEvents: Array.from({ length: totalChannels }, () => []),
            overallMaxTime: 0
        }
    );

    const sweepLineEvents = perChannelEvents.flatMap(channelIntervals => {
        const sortedIntervals = [...channelIntervals].sort((intA, intB) => intA[0] - intB[0]);

        if (sortedIntervals.length === 0) {
            return [];
        }

        const consolidatedIntervals = sortedIntervals.reduce((accumulator, currentInterval) => {
            if (accumulator.length === 0) {
                return [currentInterval];
            }
            const lastConsolidated = accumulator[accumulator.length - 1];
            if (lastConsolidated[1] + 1 >= currentInterval[0]) {
                lastConsolidated[1] = Math.max(lastConsolidated[1], currentInterval[1]);
            } else {
                accumulator.push(currentInterval);
            }
            return accumulator;
        }, []);

        return consolidatedIntervals.flatMap(([start, end]) => [
            [start - 1, 1],
            [end, -1]
        ]);
    });

    sweepLineEvents.sort((eventA, eventB) => {
        if (eventA[0] !== eventB[0]) {
            return eventA[0] - eventB[0];
        }
        return eventB[1] - eventA[1];
    });

    const finalResult = sweepLineEvents.reduce(
        ({ currentCount, highestCount }, [_, typeChange]) => {
            const updatedCount = currentCount + typeChange;
            return {
                currentCount: updatedCount,
                highestCount: Math.max(highestCount, updatedCount)
            };
        },
        { currentCount: 0, highestCount: 0 }
    );

    return finalResult.highestCount;
};

console.log(calculateMaxConcurrency());