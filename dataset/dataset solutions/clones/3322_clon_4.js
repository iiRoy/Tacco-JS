const createDataFetcher = (rawInputContent) => {
    let internalDataSegments = rawInputContent.trim().split('\n');
    let lineCursor = 0;

    const obtainValue = (numeric = true) => {
        if (lineCursor >= internalDataSegments.length) {
            return undefined;
        }

        if (typeof internalDataSegments[lineCursor] === 'string') {
            internalDataSegments[lineCursor] = internalDataSegments[lineCursor].split(' ').reverse();
        }

        let extractedToken = internalDataSegments[lineCursor].pop();

        if (internalDataSegments[lineCursor].length === 0) {
            lineCursor++;
        }
        return numeric ? parseFloat(extractedToken) : extractedToken;
    };

    const obtainRow = (numeric = true) => {
        if (lineCursor >= internalDataSegments.length) return undefined;

        let rawLine = internalDataSegments[lineCursor];
        lineCursor++;
        let tokens = rawLine.split(' ');
        return numeric ? tokens.map(parseFloat) : tokens;
    };

    const obtainBlock = (count, numeric = true) => {
        if (lineCursor + count > internalDataSegments.length) return undefined;
        let blockRows = internalDataSegments.slice(lineCursor, lineCursor + count);
        lineCursor += count;
        let processedRows = blockRows.map(row => row.split(' '));
        return numeric ? processedRows.map(row => row.map(parseFloat)) : processedRows;
    };

    const obtainSegments = (count, numeric = true) => {
        if (lineCursor + count > internalDataSegments.length) return undefined;
        let segmentRows = internalDataSegments.slice(lineCursor, lineCursor + count);
        lineCursor += count;
        return numeric ? segmentRows.map(parseFloat) : segmentRows;
    };

    return {
        obtainValue: obtainValue,
        obtainRow: obtainRow,
        obtainBlock: obtainBlock,
        obtainSegments: obtainSegments
    };
};

const dataProcessor = createDataFetcher(require("fs").readFileSync("/dev/stdin", "utf8"));

function performComputation(){
  const totalEvents = dataProcessor.obtainValue();
  const eventProbabilities = dataProcessor.obtainRow();

  const initialDistribution = [1 - eventProbabilities[0], eventProbabilities[0]];

  const finalDistribution = eventProbabilities.slice(1).reduce((currentDist, currentChance) => {
      const nextDist = Array(currentDist.length + 1).fill(0);

      nextDist[0] = currentDist[0] * (1 - currentChance);

      for (let j = 1; j < currentDist.length; j++) {
          nextDist[j] = currentDist[j - 1] * currentChance + currentDist[j] * (1 - currentChance);
      }

      nextDist[currentDist.length] = currentDist[currentDist.length - 1] * currentChance;

      return nextDist;
  }, initialDistribution);

  const requiredSuccessesThreshold = Math.ceil((totalEvents + 1) / 2);
  
  const cumulativeProbability = finalDistribution.slice(requiredSuccessesThreshold).reduce((sum, prob) => sum + prob, 0);

  return cumulativeProbability;
}

console.log(performComputation());