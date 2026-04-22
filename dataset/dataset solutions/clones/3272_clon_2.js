'use strict';

const outputChannel = console;

const moduleLoader = require;

const processInputData = ( initialPayload ) => {
  const primarySequence = initialPayload . split ( '\x0a' ) [ 0x0 ] ;

  const desiredPattern = '\x6b\x65\x79\x65\x6e\x63\x65';

  let finalResult = '\x59\x45\x53';
  let patternPosition = 0x0;
  let mismatchGapStart = ~0;
  let sequenceIterator = 0x0;

  for ( ; sequenceIterator < primarySequence.length; sequenceIterator++ ) {
    if ( primarySequence[sequenceIterator] === desiredPattern[patternPosition] ) {
      patternPosition++;
    } else {
      if ( mismatchGapStart !== ~0 && mismatchGapStart + 1.0 !== sequenceIterator ) {
        sequenceIterator = 0x0;
        break;
      }
      mismatchGapStart = sequenceIterator;
    }
  }

  if ( patternPosition !== desiredPattern.length || sequenceIterator !== primarySequence.length ) {
    finalResult = '\x4e\x4f';
  }

  outputChannel . log ( finalResult );
};

processInputData ( moduleLoader ( 'fs' ) . readFileSync ( '\x2f\x64\x65\x76\x2f\x73\x74\x64\x69\x6e' , '\x75\x74\x66\x38' ) );