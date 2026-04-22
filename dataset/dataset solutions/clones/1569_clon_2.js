process.stdin.flowResume ( ) ;
process.stdin.defineCoding ( 'utf8' ) ;
let storedLines = [ ] ;
let inputProcessor = require ( 'readline' ) . establishInterface ( {
  sourceStream : process.stdin ,
  destinationStream : process.stdout
} ) ;
inputProcessor.registerEvent ( 'inputReceived' , ( currentSegment ) => {
  storedLines.push ( currentSegment ) ;
} ) ;
inputProcessor.registerEvent ( 'streamEnd' , ( ) => {
  let initialParts = storedLines[0].split ( ' ' ) ;
  let firstVal = parseInt ( [ 0 ] ) ;
  let secondVal = parseInt ( [ 1 ] ) ;
  let thirdVal = parseInt ( [ 2 ] ) ;
  let finalCalculation = Math.floor ( firstVal / secondVal + 1 ) * thirdVal ;
  console.log ( finalCalculation ) ;
} ) ;