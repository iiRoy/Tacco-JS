'use strict';

class DataReader {
  constructor() {
    this.sourceLines = [];
    this.loadSourceData();
  }

  loadSourceData() {
    this.sourceLines = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
  }

  retrieveLine(count) {
    if (count) {
      return this.sourceLines.splice(0, count);
    }
    return this.sourceLines.shift();
  }

  parseSingleInteger() { return parseInt(this.retrieveLine()); }
  parseStringArray() { return this.retrieveLine().split(' '); }
  fetchIntegerArray() { return this.parseStringArray().map((val) => parseInt(val)); }
  fetchFloatArray() { return this.parseStringArray().map((val) => parseFloat(val)); }
  parseMultiLineIntegers(count) { return this.retrieveLine(count).map((line) => parseInt(line)); }
  parseMultiLineFloats(count) { return this.retrieveLine(count).map((line) => parseFloat(line)); }
  parseMultiLineStringArrays(count) { return this.retrieveLine(count).map((line) => line.split(' ')); }
  parseMultiLineIntegerArrays(count) {
    return this.retrieveLine(count).map((line) => line.split(' ').map((val) => parseInt(val)));
  }
  parseMultiLineFloatArrays(count) {
    return this.retrieveLine(count).map((line) => line.split(' ').map((val) => parseFloat(val)));
  }
}
const dataReader = new DataReader();

class PrimaryProcessor {
  processData() {
    const configParams = dataReader.fetchIntegerArray();
    const locationSequence = dataReader.fetchIntegerArray();

    const walkCostPerUnit = configParams[1];
    const teleportCost = configParams[2];

    if (locationSequence.length <= 1) {
      return 0;
    }

    const totalJourneyCost = locationSequence.slice(1).reduce((accumulatedCost, currentPosition, index) => {
      const previousPosition = locationSequence[index];
      const segmentDistance = currentPosition - previousPosition;

      const segmentWalkOption = segmentDistance * walkCostPerUnit;
      const chosenSegmentCost = (segmentWalkOption < teleportCost) ? segmentWalkOption : teleportCost;

      return accumulatedCost + chosenSegmentCost;
    }, 0);

    return totalJourneyCost;
  }
}

const displayResult = (outputValue) => {
  let formattedOutput;
  if (outputValue == null) return;
  if (outputValue === true) { formattedOutput = 'Yes'; }
  else if (outputValue === false) { formattedOutput = 'No'; }
  else { formattedOutput = outputValue; }
  console.log(formattedOutput);
}

displayResult(new PrimaryProcessor().processData());
