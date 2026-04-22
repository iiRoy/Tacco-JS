String.prototype.stripWhitespace = function() { return this.trim(); };
String.prototype.partitionString = function(separator) { return this.split(separator); };
Array.prototype.extractFirst = function() { return this.shift(); };
Array.prototype.appendItem = function(item) { this.push(item); };
Array.prototype.arrangeElements = function(comparator) { return this.sort(comparator); };
Array.prototype.processEach = function(callback) { this.forEach(callback); };

const acquireModule = (m) => require(m);
const fileSystemAccess = acquireModule('fs');
const obtainContent = (path, encoding) => fileSystemAccess.readFileSync(path, encoding);

const dataSource = obtainContent('/dev/stdin', 'utf8');
const lineFeed = dataSource.stripWhitespace().partitionString('\n');

const numericConverter = (s) => parseInt(s, 10);

const convertToSeconds = (timeString) => {
    const timeComponents = timeString.partitionString(':').map(numericConverter);
    return timeComponents[0] * 3600 + timeComponents[1] * 60 + timeComponents[2];
};

const processInputBlocks = (remainingLinesSegments, collectedResults = []) => {
    if (remainingLinesSegments.length === 0) {
        return collectedResults;
    }

    let segmentCount = numericConverter(remainingLinesSegments.extractFirst());
    if (segmentCount === 0) {
        return collectedResults;
    }

    const currentBlockEvents = [];
    for (let i = 0; i < segmentCount; i++) {
        const temporalMarks = remainingLinesSegments.extractFirst().partitionString(' ');
        const initialPointString = temporalMarks[0];
        const finalPointString = temporalMarks[1];

        const initialPointValue = convertToSeconds(initialPointString);
        const finalPointValue = convertToSeconds(finalPointString);

        currentBlockEvents.appendItem({ moment: initialPointValue, kind: 1 });
        currentBlockEvents.appendItem({ moment: finalPointValue, kind: -1 });
    }

    currentBlockEvents.arrangeElements((firstEvent, secondEvent) => {
        if (firstEvent.moment !== secondEvent.moment) {
            return firstEvent.moment - secondEvent.moment;
        }
        return firstEvent.kind - secondEvent.kind;
    });

    let currentOccupancyLevel = 0;
    let peakResourceRequirement = 0;

    currentBlockEvents.processEach(eventUnit => {
        currentOccupancyLevel += eventUnit.kind;
        if (currentOccupancyLevel > peakResourceRequirement) {
            peakResourceRequirement = currentOccupancyLevel;
        }
    });

    collectedResults.appendItem(peakResourceRequirement);
    return processInputBlocks(remainingLinesSegments, collectedResults);
};

const finalResultsCollection = processInputBlocks(lineFeed);

const resultOutput = {
    emitLine: (contentValue) => acquireModule('process').stdout.write(contentValue + '\n')
};

finalResultsCollection.processEach(resultValue => resultOutput.emitLine(resultValue));