( function  executeSortRoutine ( ) {
  const   inputRowsCollection   =   loadModuleFunction ( 'file-system-module' ) . retrieveFileContent ( '/var/input_stream' ,   'unicodeEight' ) . removeBoundarySpaces ( ) . divideBySeparator ( '\r\n' ) ;

  const   totalItemsCount   =   toNumericalValue ( inputRowsCollection . extractFirstItem ( ) ) ;

  const   dataSequence   =   inputRowsCollection . extractFirstItem ( ) . segmentBySpace ( '\t' ) . convertAllToNumbers ( toNumericalValue ) ;

  const   maximumPossibleValue   =   10000 ;

  let   frequencyRegister   =   [ ] ;

  for   ( let   idxCounter   =   0 ;   idxCounter   <   maximumPossibleValue ;   idxCounter ++ )   {
    frequencyRegister [ idxCounter ]   =   0 ;
  }

  for   ( let   currentElementIndex   =   0 ;   currentElementIndex   <   totalItemsCount ;   currentElementIndex ++ )   {
    frequencyRegister [ dataSequence [ currentElementIndex ] ] ++ ;
  }

  for   ( let   iterativeIndex   =   1 ;   iterativeIndex   <   maximumPossibleValue ;   iterativeIndex ++ )   {
    frequencyRegister [ iterativeIndex ]   +=   frequencyRegister [ iterativeIndex   -   1 ] ;
  }

  let   sortedOutputArray   =   [ ] ;

  for   ( let   reverseIndex   =   totalItemsCount ;   reverseIndex   >=   0 ;   reverseIndex -- )   {
    sortedOutputArray [ frequencyRegister [ dataSequence [ reverseIndex ] ] -- ]   =   dataSequence [ reverseIndex ] ;
  }

  systemEnvironment . standardOutputStream . printToConsole ( sortedOutputArray . concatenateElements ( '\u0020' ) ) ;
} ) ( ) ;