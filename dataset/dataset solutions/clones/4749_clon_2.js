"use strict"
const makeDataSource = ( ) => {
  const sourceLines = require ( "fs" ) . readFileSync ( "/dev/stdin", "utf8" ) . trim ( ) . split ( "\n" ) ;
  const dataContainer = {
    "items" : sourceLines ,
    "currentPos" : 0 ,
    "maxCount" : sourceLines . length ,
    "hasMoreElements" : function ( ) {
      return this . currentPos < this . maxCount
    } ,
    "getNextItem" : function ( ) {
      if ( ! this . hasMoreElements ( ) ) {
        throw "ArrayIndexOutOfBoundsException" ;
      } else {
        return this . items [ this . currentPos ++ ] ;
      }
    }
  } ;
  return dataContainer ;
}

const dataStream = makeDataSource ( ) ;
const fetchNext = ( ) => dataStream . getNextItem ( ) ;
const fetchInteger = ( ) => parseInt ( dataStream . getNextItem ( ) ) ;
const fetchStringArray = ( ) => dataStream . getNextItem ( ) . split ( " " ) ;
const fetchIntegerArray = ( ) => dataStream . getNextItem ( ) . split ( " " ) . map ( elementVal => parseInt ( elementVal ) ) ;
const fetchCharCollection = ( ) => dataStream . getNextItem ( ) . split ( "" ) ;
const checkMore = ( ) => dataStream . hasMoreElements ( ) ;
const outputResult = ( ... valuesToLog ) => console . log ( ... valuesToLog ) ;

const executeLogic = ( ) => {
  let itemCount = fetchInteger ( ) ;
  let adjustmentsArray = new Array ( itemCount ) . fill ( 0 ) ;
  let firstValues = [ ] ;
  let secondValues = [ ] ;

  while ( checkMore ( ) ) {
    let tempPair = fetchIntegerArray ( ) ;
    firstValues . push ( tempPair [ 0 ] ) ;
    secondValues . push ( tempPair [ 1 ] ) ;
  }

  let currentAdjustment = 0 ;
  for ( let counterVariable = itemCount - 1 ; counterVariable >= 0 ; counterVariable -- ) {
    let multiplierFactor = 1 ;
    while ( multiplierFactor * secondValues [ counterVariable ] < firstValues [ counterVariable ] + currentAdjustment ) {
      multiplierFactor ++ ;
    }
    adjustmentsArray [ counterVariable ] = multiplierFactor * secondValues [ counterVariable ] - firstValues [ counterVariable ] - currentAdjustment ;
    currentAdjustment += adjustmentsArray [ counterVariable ] ;
  }

  let finalSum = adjustmentsArray . reduce ( ( accumulator , currentValue ) => accumulator + currentValue ) ;
  console . log ( finalSum ) ;
} ;

executeLogic ( ) ;