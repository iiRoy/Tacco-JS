"use strict";

function I(sourceText, defaultConverter = Number) {
    this._contentBuffer = sourceText;
    this._currentPosition = 0;
    this._defaultTransform = defaultConverter;
}

I.prototype.a = function(customConverter) {
    if (this._currentPosition >= this._contentBuffer.length) {
        return undefined;
    }

    let spaceDelimiter = this._contentBuffer.indexOf(' ', this._currentPosition);
    let lineDelimiter = this._contentBuffer.indexOf('\n', this._currentPosition);

    let effectiveDelimiter;
    if (spaceDelimiter === -1 && lineDelimiter === -1) {
        effectiveDelimiter = this._contentBuffer.length;
    } else if (spaceDelimiter === -1) {
        effectiveDelimiter = lineDelimiter;
    } else if (lineDelimiter === -1) {
        effectiveDelimiter = spaceDelimiter;
    } else {
        effectiveDelimiter = Math.min(spaceDelimiter, lineDelimiter);
    }

    const tokenString = this._contentBuffer.substring(this._currentPosition, effectiveDelimiter).trim();
    this._currentPosition = effectiveDelimiter + 1;

    while (this._currentPosition < this._contentBuffer.length &&
           (this._contentBuffer[this._currentPosition] === ' ' || this._contentBuffer[this._currentPosition] === '\n')) {
        this._currentPosition++;
    }

    return (customConverter || this._defaultTransform)(tokenString);
};

I.prototype.l = function(customConverter) {
    if (this._currentPosition >= this._contentBuffer.length) {
        return undefined;
    }

    let lineDelimiter = this._contentBuffer.indexOf('\n', this._currentPosition);
    let lineContent;

    if (lineDelimiter === -1) {
        lineContent = this._contentBuffer.substring(this._currentPosition);
        this._currentPosition = this._contentBuffer.length;
    } else {
        lineContent = this._contentBuffer.substring(this._currentPosition, lineDelimiter);
        this._currentPosition = lineDelimiter + 1;
    }

    while (this._currentPosition < this._contentBuffer.length &&
           (this._contentBuffer[this._currentPosition] === ' ' || this._contentBuffer[this._currentPosition] === '\n')) {
        this._currentPosition++;
    }

    return lineContent.trim().split(" ").map(customConverter || this._defaultTransform);
};

module.exports = I;

const primeDivisor = 1000003;

function processCalculations(sourceData) {
  const dataParser = new I(sourceData);

  const totalOperations = dataParser.a();
  
  Array.from({ length: totalOperations }).forEach(() => {
    const baseValue = dataParser.a();
    const incrementStep = dataParser.a();
    const termCount = dataParser.a();

    if (termCount >= primeDivisor) {
      console.log(0);
    } else {
      const finalProduct = Array.from({ length: termCount }).reduce((currentResult, _, index) => {
        const currentTerm = baseValue + index * incrementStep;
        return (currentResult * currentTerm) % primeDivisor;
      }, 1);

      console.log(finalProduct);
    }
  });
}

processCalculations(require("fs").readFileSync("/dev/stdin", "utf8"));
