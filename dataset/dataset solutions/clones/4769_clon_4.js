'use strict';

const acquireRawInput = () => require("fs").readFileSync("/dev/stdin", "utf8");

class DataStreamHandler {
  constructor(rawDataContent) {
    this.lineBuffer = rawDataContent.split('\n');
    this.currentLineIndex = 0;
  }

  fetchNextLine() {
    if (this.currentLineIndex >= this.lineBuffer.length) {
      return undefined;
    }
    return this.lineBuffer[this.currentLineIndex++];
  }

  retrieveNumericArray() {
    const lineContent = this.fetchNextLine();
    if (lineContent === undefined || lineContent.trim() === '') {
      return [];
    }
    return lineContent.split(' ').map(Number);
  }
}

class ValueAggregator {
  processSequence(configurationParameters, numericalSeries) {
    const multiplier = configurationParameters[1];
    const capValue = configurationParameters[2];

    if (numericalSeries.length < 2) {
      return 0;
    }

    const finalAccumulation = numericalSeries.reduce((currentSum, element, index, fullArray) => {
      if (index === 0) {
        return currentSum;
      }
      const priorElement = fullArray[index - 1];
      const elementDifference = element - priorElement;
      return currentSum + Math.min(elementDifference * multiplier, capValue);
    }, 0);

    return finalAccumulation;
  }
}

const rawInputContent = acquireRawInput();
const dataHandler = new DataStreamHandler(rawInputContent);

const configuration = dataHandler.retrieveNumericArray();
const seriesData = dataHandler.retrieveNumericArray();

const aggregatorInstance = new ValueAggregator();
const computedResult = aggregatorInstance.processSequence(configuration, seriesData);

console.log(computedResult);
