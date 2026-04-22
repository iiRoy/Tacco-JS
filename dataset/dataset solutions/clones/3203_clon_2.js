"use strict";
function ContentStream( sourceData, typeConverter ){
  this._rawData = sourceData;
  this._columnPointer = 0;
  this._linePointer = 0;
  this._parseFunction = typeConverter || Number;
}
ContentStream.prototype.retrieveNext = function(  ) {
  var   currentSegment = this._rawData.split( "\n" )[ this._linePointer ];
  if ( !currentSegment ) return;
  var segmentParts = currentSegment.trim().split( " " );
  var itemValue = segmentParts[ this._columnPointer ];
  this._columnPointer++;
  if ( segmentParts.length === this._columnPointer ) {
    this._columnPointer = 0;
    this._linePointer++;
  }
  return this._parseFunction(itemValue);
};
ContentStream.prototype.getLineValues = function(  ) {
  var lineFragment = this._rawData.split( "\n" )[ this._linePointer ];
  this._columnPointer = 0;
  this._linePointer++;
  return lineFragment.split( " " ).map( this._parseFunction );
};

// This function processes the input text to determine a specific pattern.
function processInputData( rawTextContent ) {
  const dataStream = new ContentStream(rawTextContent);

  const occurrenceCounts = Array(4).fill(0);

  for ( let loopIndex = 0; loopIndex < 3; loopIndex++ ) {
    let firstElement = dataStream.retrieveNext();
    let secondElement = dataStream.retrieveNext();
    occurrenceCounts[firstElement - 1]++;
    occurrenceCounts[secondElement - 1]++;
  }

  if ( occurrenceCounts.sort((valA, valB) => valA - valB).join(" ") === "1 1 2 2" ) {
    console.log("YES");
  } else {
    console.log("NO");
  }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));