'use strict';

const processData =  rawData  =>  {
  const parsedLines = rawData .  trim()  .  split (  '\n'  ) ;

  let countVal = parsedLines[0] .  split (' ') [0];
  let baseVal = parsedLines[0] .  split (' ') [1];

  let finalOutput = baseVal;

  for (  let counter = 1;  counter < countVal;  counter++  ) {
    finalOutput =  finalOutput  *  (baseVal - 1) ;
  }

  console .  log (finalOutput) ;
}   ;

processData( require('fs') .  readFileSync( '/dev/stdin',  'utf8') );