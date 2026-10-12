"use strict";
function I(sourceTextContent, valueConversionFunction) {
    this.parsedSegments = sourceTextContent.split("\n").map(line => line.trim().split(" "));
    this.currentSegmentIndex = 0;
    this.currentTokenPosition = 0;
    this.defaultParser = valueConversionFunction || Number;
}

I.prototype.a = function(customParser) {
    const activeLineTokens = this.parsedSegments[this.currentSegmentIndex];
    
    if (!activeLineTokens) {
        return undefined;
    }

    const currentTokenString = activeLineTokens[this.currentTokenPosition];
    this.currentTokenPosition++;

    if (this.currentTokenPosition >= activeLineTokens.length) {
        this.currentTokenPosition = 0; 
        this.currentSegmentIndex++; 
    }

    return (customParser || this.defaultParser)(currentTokenString);
};

I.prototype.l = function(customParser) {
    const activeLineTokens = this.parsedSegments[this.currentSegmentIndex];
    
    if (!activeLineTokens) {
        return undefined;
    }

    this.currentTokenPosition = 0; 
    this.currentSegmentIndex++; 

    return activeLineTokens.map(customParser || this.defaultParser);
};

module.exports = I;

function calculateRangeLength(sourceData) {
    const dataReader = new I(sourceData); 

    const startValue = dataReader.a(); 
    const endValue = dataReader.a(); 
    
    console.log(startValue - endValue + 1);
}

calculateRangeLength(require("fs").readFileSync("/dev/stdin", "utf8"));
