function processSequence ( rawData ) {
  let   growthRate   =   rawData . split ( " " ) [ 0 ]   - 0 ;
  let   decayAmount   =   rawData . split ( " " ) [ 1 ]   - 0 ;
  let   startingPoint   =   rawData . split ( " " ) [ 2 ]   - 0 ;

  const   sequenceValues   =   [ ] ;
  sequenceValues [ 0 ]   =   startingPoint ;

  for   ( let   counter   =   1 ;   counter   <=   10 ;   counter ++ )
  {
    sequenceValues [ counter ]   =   growthRate   *   sequenceValues [ counter - 1 ]   -   decayAmount ;
    console . log ( sequenceValues [ counter ] ) ;
  }
}

processSequence ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;