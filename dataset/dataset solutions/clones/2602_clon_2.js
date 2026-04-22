"use strict";

const makeInputReader = ( ) => {
  const rawData = require("fs") .readFileSync("/dev/stdin", "utf8") .trim() .split("\n") ;

  const readerObject = {
    dataLines: rawData,
    currentPos: 0,
    totalLines: rawData.length,

    hasMoreData: function() {
      return this.currentPos < this.totalLines;
    },

    retrieveNext: function() {
      if ( ! this.hasMoreData() ) {
        throw "EndOfInputError";
      } else {
        return this.dataLines[ this.currentPos++ ];
      }
    }
  };

  return readerObject;
};

const inputSupplier = makeInputReader();

const fetchNextLine = () => inputSupplier.retrieveNext();

const fetchNextInteger = ( ) => parseInt( inputSupplier.retrieveNext() );

const fetchNextStringArray = ( ) => inputSupplier.retrieveNext().split(" ");

const fetchNextIntegerArray = ( ) => inputSupplier.retrieveNext() .split(" ") .map(item => parseInt(item));

const fetchNextCharacterArray = ( ) => inputSupplier.retrieveNext() .split("");

const checkMoreInput = ( ) => inputSupplier.hasMoreData();

const displayOutput = ( ...outputItems ) => console.log( ...outputItems );

const ExecuteProgram = ( ) => {
  let limitValue = fetchNextInteger();
  let cumulativeSum = 0;

  for ( let counter = 1; counter < limitValue; counter++ ) {
    cumulativeSum += counter;
  }

  console.log( cumulativeSum );
};

ExecuteProgram();