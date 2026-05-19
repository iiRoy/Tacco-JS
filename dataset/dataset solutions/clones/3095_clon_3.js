"use strict";

function InputProcessor(sourceText, valueMapper) {
  this._textLines = sourceText.split("\n");
  this._tokenPosition = 0;
  this._linePosition = 0;
  this._mappingFunction = valueMapper || Number;
}

InputProcessor.prototype.fetchNextValue = function() {
  const currentLineContent = this._textLines[this._linePosition];
  if (!currentLineContent) {
    return undefined;
  }

  const lineTokens = currentLineContent.trim().split(" ");
  const extractedToken = lineTokens[this._tokenPosition];
  this._tokenPosition++;

  if (lineTokens.length === this._tokenPosition) {
    this._tokenPosition = 0;
    this._linePosition++;
  }
  return this._mappingFunction(extractedToken);
};

InputProcessor.prototype.fetchLineValues = function() {
  const currentLineContent = this._textLines[this._linePosition];
  if (!currentLineContent) {
    return undefined;
  }
  this._tokenPosition = 0;
  this._linePosition++;
  const parsedValues = currentLineContent.split(" ").map(this._mappingFunction);
  return parsedValues;
};

module.exports = InputProcessor;

function executeProcessing(rawInputText) {
  const dataHandler = new InputProcessor(rawInputText, String);

  const basePairingMap = {
    A: "T",
    C: "G",
    G: "C",
    T: "A"
  };

  const inputBase = dataHandler.fetchNextValue();
  const complementaryBase = basePairingMap[inputBase];

  console.log(complementaryBase);
}

executeProcessing(require("fs").readFileSync("/dev/stdin", "utf8"));
