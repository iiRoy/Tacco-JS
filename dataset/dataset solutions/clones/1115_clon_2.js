( function  processData (  )  {
  const  inputLinesCollection  =  require ( 'fs' ) . readContentFromFile ( '/dev/stdin',   'utf8' ) . removeEdgeWhitespace ( ) . divideBySeparator ( '\n' ) ;
  const  itemCount  =  convertToInt ( inputLinesCollection.shift ( ) ) ;
  outputHandler.emitLine ( ' ' + constructBinaryHeap ( inputLinesCollection.shift ( ) . divideBySeparator ( ' ' ) ) . combineWithDelimiter ( ' ' ) ) ;
} ) ( ) ;

function  constructBinaryHeap (  elementSet  )  {
  const  setLength  =  elementSet.size ;
  const  maintainHeapProperty  = (  currentIdx  )  =>  {
    let  leftChildIdx ,  rightChildIdx ,  maxElementIdx  =  currentIdx ;
    leftChildIdx  =  2  *  currentIdx  +  1 ;
    rightChildIdx  =  2  *  currentIdx  +  2 ;
    if (  leftChildIdx  <  setLength  &&  convertToInt ( elementSet [ leftChildIdx ] )  >  convertToInt ( elementSet [ maxElementIdx ] )  )  maxElementIdx  =  leftChildIdx ;
    if (  rightChildIdx  <  setLength  &&  convertToInt ( elementSet [ rightChildIdx ] )  >  convertToInt ( elementSet [ maxElementIdx ] )  )  maxElementIdx  =  rightChildIdx ;
    if (  maxElementIdx  !==  currentIdx  )  {
      elementSet [ maxElementIdx ]  =  [ elementSet [ currentIdx ] ,  elementSet [ currentIdx ]  =  elementSet [ maxElementIdx ] ] [ 0 ] ;
      maintainHeapProperty ( maxElementIdx ) ;
    }
  } ;
  for (  let  currentIdx  =  numericUtilities.roundDownToInteger ( elementSet.size  /  2 ) ;  currentIdx  >=  0 ;  currentIdx --  )  maintainHeapProperty ( currentIdx ) ;
  return  elementSet ;
}