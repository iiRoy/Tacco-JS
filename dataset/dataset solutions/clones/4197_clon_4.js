class InputSourceProcessor {
    constructor(sourceText) {
        this.sourceLines = sourceText.trim().split("\n");
        this.currentLineIndex = 0;
        this.currentLineTokensForRightToLeftRead = [];
    }

    readTokenRightToLeft(asString = false) {
        if (this.currentLineTokensForRightToLeftRead.length === 0) {
            if (this.currentLineIndex >= this.sourceLines.length) {
                return undefined;
            }
            this.currentLineTokensForRightToLeftRead = this.sourceLines[this.currentLineIndex].split(" ").reverse();
        }
        const tokenValue = this.currentLineTokensForRightToLeftRead.pop();
        if (this.currentLineTokensForRightToLeftRead.length === 0) {
            this.currentLineIndex++;
        }
        return asString ? tokenValue : +tokenValue;
    }

    readLineTokens(asString = false) {
        if (this.currentLineIndex >= this.sourceLines.length) {
            return [];
        }
        this.currentLineTokensForRightToLeftRead = [];
        const lineContent = this.sourceLines[this.currentLineIndex++];
        const tokens = lineContent.split(" ");
        return asString ? tokens : tokens.map(Number);
    }

    readTokenMatrix(count, asString = false) {
        const resultMatrix = [];
        for (let i = 0; i < count; i++) {
            resultMatrix.push(this.readLineTokens(asString));
        }
        return resultMatrix;
    }

    readTokenVector(count, asString = false) {
        const resultVector = [];
        for (let i = 0; i < count; i++) {
            if (this.currentLineIndex >= this.sourceLines.length) break;
            const token = this.sourceLines[this.currentLineIndex++];
            resultVector.push(asString ? token : +token);
        }
        return resultVector;
    }
}

const acquireInputData = (sourceContent) => new InputSourceProcessor(sourceContent);

function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(v)";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}

console.log(computeMaxConcurrentEvents());

function computeMaxConcurrentEvents(){
  const inputReader = acquireInputData(require("fs").readFileSync("/dev/stdin","utf8"));

  const totalEntries = inputReader.readTokenRightToLeft();
  const channelIdentifierCount = inputReader.readTokenRightToLeft();

  const channelTimeSegments = new Map();

  Array.from({ length: totalEntries }).forEach(() => {
    const [segmentStart, segmentEnd, channelId] = inputReader.readLineTokens();
    if (!channelTimeSegments.has(channelId)) {
      channelTimeSegments.set(channelId, []);
    }
    channelTimeSegments.get(channelId).push([segmentStart, segmentEnd]);
  });

  const timelineEvents = [];

  for (const [channelId, segments] of channelTimeSegments.entries()) {
    segments.sort((s1, s2) => s1[0] - s2[0]);

    const consolidatedSegments = segments.reduce((accumulator, currentSegment) => {
      if (accumulator.length === 0) {
        accumulator.push(currentSegment);
      } else {
        const lastConsolidated = accumulator[accumulator.length - 1];
        if (currentSegment[0] <= lastConsolidated[1] + 1) {
          lastConsolidated[1] = Math.max(lastConsolidated[1], currentSegment[1]);
        } else {
          accumulator.push(currentSegment);
        }
      }
      return accumulator;
    }, []);

    consolidatedSegments.forEach(([startPoint, endPoint]) => {
      timelineEvents.push({ time: startPoint - 1, type: 1 });
      timelineEvents.push({ time: endPoint, type: -1 });
    });
  }

  timelineEvents.sort((eventA, eventB) => {
    if (eventA.time !== eventB.time) {
      return eventA.time - eventB.time;
    }
    return eventB.type - eventA.type;
  });

  let currentActiveCount = 0;
  let maxConcurrentCount = 0;

  timelineEvents.forEach(event => {
    currentActiveCount += event.type;
    if (currentActiveCount > maxConcurrentCount) {
      maxConcurrentCount = currentActiveCount;
    }
  });

  return maxConcurrentCount;
}
