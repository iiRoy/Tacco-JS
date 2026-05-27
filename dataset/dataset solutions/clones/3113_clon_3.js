'use strict'

class SolutionProcessor {
  execute() {
    const initialInputArray = dataReader.fetchIntArray();
    const inputVal = initialInputArray[0];

    const elementGroups = [];
    let adjustedVal;

    const isInputValOdd = (inputVal % 2 !== 0);
    if (isInputValOdd) {
      elementGroups.push([inputVal]);
      adjustedVal = inputVal - 1;
    } else {
      adjustedVal = inputVal;
    }

    this._populateInitialGroups(adjustedVal, elementGroups);

    const resultCombinations = this._generateAllCombinations(elementGroups);

    console.log(resultCombinations.length);
    const formattedOutput = resultCombinations.map((pair) => pair.join(' ')).join('\n');
    console.log(formattedOutput);
  }

  _populateInitialGroups(limitValue, currentGroups) {
    const halfLimit = limitValue / 2;
    for (let idx = 0; idx < halfLimit; ++idx) {
      currentGroups.push([idx + 1, limitValue - idx]);
    }
  }

  _generateAllCombinations(sourceGroups) {
    let generatedCombinations = [];
    const totalGroupsCount = sourceGroups.length;

    for (let groupIdx = 0; groupIdx < totalGroupsCount; ++groupIdx) {
      const currentGroupElements = sourceGroups[groupIdx];
      const nextGroupIndex = (groupIdx + 1) % totalGroupsCount;
      const nextGroupElements = sourceGroups[nextGroupIndex];

      for (const firstElem of currentGroupElements) {
        for (const secondElem of nextGroupElements) {
          generatedCombinations.push([firstElem, secondElem]);
        }
      }
    }
    return generatedCombinations;
  }
}

class DataStreamReader {
  constructor() {
    this.readPointer = 0;
    this.loadAllData();
  }

  loadAllData() {
    const fileSystem = require("fs");
    this.rawDataLines = (fileSystem.readFileSync("/dev/stdin", "utf8")).split('\n');
    return this.rawDataLines;
  }

  fetchNextLine(numLines) {
    if (numLines) {
      const retrievedLines = this.rawDataLines.slice(this.readPointer, this.readPointer + numLines);
      this.readPointer += numLines;
      return retrievedLines;
    }
    const singleLine = this.rawDataLines[this.readPointer];
    this.readPointer += 1;
    return singleLine;
  }

  _parseNumbersFromLine(lineContent, parserFunction) {
    return lineContent.split(' ').map(parserFunction);
  }

  _mapLinesToNumbers(linesArray, parserFunction) {
    return linesArray.map(parserFunction);
  }

  _mapLinesToNumberMatrix(linesArray, cellParserFunction) {
    return linesArray.map((line) => line.split(' ').map(cellParserFunction));
  }

  fetchStringArray() { return this.fetchNextLine().split(' '); }
  fetchIntArray() { return this._parseNumbersFromLine(this.fetchNextLine(), parseInt); }
  fetchFloatArray() { return this._parseNumbersFromLine(this.fetchNextLine(), parseFloat); }

  fetchIntLines(numLines) { return this._mapLinesToNumbers(this.fetchNextLine(numLines), parseInt); }
  fetchFloatLines(numLines) { return this._mapLinesToNumbers(this.fetchNextLine(numLines), parseFloat); }

  fetchStringMatrix(numLines) { return this.fetchNextLine(numLines).map((line) => line.split(' ')); }
  fetchIntMatrix(numLines) {
    return this._mapLinesToNumberMatrix(this.fetchNextLine(numLines), parseInt);
  }
  fetchFloatMatrix(numLines) {
    return this._mapLinesToNumberMatrix(this.fetchNextLine(numLines), parseFloat);
  }
}

const dataReader = new DataStreamReader();
(new SolutionProcessor()).execute();
