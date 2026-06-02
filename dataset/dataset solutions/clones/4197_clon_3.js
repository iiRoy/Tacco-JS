class InputParser {
    #lines;
    #currentLineIndex;

    constructor(inputString) {
        this.#lines = inputString.trim().split("\n");
        this.#currentLineIndex = 0;
    }

    #convertValue(value, asString) {
        return asString ? value : +value;
    }

    readNextToken(asString) {
        let currentLineTokens = this.#lines[this.#currentLineIndex];
        let tokenValue;

        if (typeof currentLineTokens === "string") {
            currentLineTokens = currentLineTokens.split(" ").reverse();
            this.#lines[this.#currentLineIndex] = currentLineTokens;
        }

        tokenValue = currentLineTokens.pop();

        if (currentLineTokens.length === 0) {
            this.#currentLineIndex++;
        }

        return this.#convertValue(tokenValue, asString);
    }

    readLineTokens(asString) {
        const lineContent = this.#lines[this.#currentLineIndex++];
        const tokens = lineContent.split(" ");
        return asString ? tokens : tokens.map(val => +val);
    }

    readMatrix(rowCount, asString) {
        const matrixRows = this.#lines.slice(this.#currentLineIndex, this.#currentLineIndex += rowCount)
                                     .map(rowStr => rowStr.split(" "));
        return asString ? matrixRows : matrixRows.map(row => row.map(val => +val));
    }

    readRawLines(rowCount, asString) {
        const rawLines = this.#lines.slice(this.#currentLineIndex, this.#currentLineIndex += rowCount);
        return asString ? rawLines : rawLines.map(val => +val);
    }
}

const inputReader = new InputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initialValue) {
    const dimensions = arguments;
    let dimCount = dimensions.length;
    let arrayCreationString = "Array(dimensions[" + --dimCount + "]).fill(initialValue)";
    while (--dimCount) {
        arrayCreationString = "Array(dimensions[" + dimCount + "]).fill(0).map(x=>" + arrayCreationString + ")";
    }
    return eval(arrayCreationString);
}

console.log(processSchedule());

function processSchedule() {
    const numEvents = inputReader.readNextToken();
    const numChannels = inputReader.readNextToken();

    const channelSchedules = Array(numChannels).fill(null).map(() => []);
    let maxEndTime = 0;

    const recordEventDetails = (eventData) => {
        const eventChannelIndex = eventData[2] - 1;
        const eventStart = eventData[0];
        const eventEnd = eventData[1];

        channelSchedules[eventChannelIndex].push([eventStart, eventEnd]);
        if (maxEndTime < eventEnd) {
            maxEndTime = eventEnd;
        }
    };

    for (let eventIdx = 0; eventIdx < numEvents; eventIdx++) {
        const currentEventData = inputReader.readLineTokens();
        recordEventDetails(currentEventData);
    }

    const startTimes = [];
    const endTimes = [];

    const mergeChannelEvents = (currentChannelSchedule) => {
        if (currentChannelSchedule.length === 0) {
            return;
        }

        currentChannelSchedule.sort((a, b) => a[0] - b[0]);

        let scheduleEntryIdx = 0;
        const channelScheduleLength = currentChannelSchedule.length;

        while (scheduleEntryIdx < channelScheduleLength) {
            const currentEventSegment = currentChannelSchedule[scheduleEntryIdx];
            startTimes.push(currentEventSegment[0] - 1);

            let mergeEndIdx = scheduleEntryIdx;
            while (mergeEndIdx + 1 < channelScheduleLength &&
                   currentChannelSchedule[mergeEndIdx][1] + 1 >= currentChannelSchedule[mergeEndIdx + 1][0]) {
                mergeEndIdx++;
            }
            endTimes.push(currentChannelSchedule[mergeEndIdx][1]);
            scheduleEntryIdx = mergeEndIdx + 1;
        }
    };

    for (let channelIdx = 0; channelIdx < numChannels; channelIdx++) {
        mergeChannelEvents(channelSchedules[channelIdx]);
    }

    startTimes.sort((a, b) => a - b);
    endTimes.sort((a, b) => a - b);

    let startPointer = 0;
    let endPointer = 0;
    let maxConcurrentEvents = 0;
    let currentConcurrentEvents = 0;

    const updateConcurrencyAtTimePoint = (timePoint) => {
        while (endPointer < endTimes.length && endTimes[endPointer] === timePoint) {
            currentConcurrentEvents--;
            endPointer++;
        }
        while (startPointer < startTimes.length && startTimes[startPointer] === timePoint) {
            currentConcurrentEvents++;
            startPointer++;
        }
        if (maxConcurrentEvents < currentConcurrentEvents) {
            maxConcurrentEvents = currentConcurrentEvents;
        }
    };

    for (let timePoint = 0; timePoint <= maxEndTime; timePoint++) {
        updateConcurrencyAtTimePoint(timePoint);
    }

    return maxConcurrentEvents;
}
