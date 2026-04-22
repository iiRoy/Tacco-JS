( function executeProgram ()
{
  const inputDataLines = acquireModule ( 'fileSystemOps' )
    .obtainFileContentSync ( '/dev/stdin' ,  'utf8'  )
    .stripWhitespace ()
    .segmentByDelimiter ( '\n' ) ;
  const totalElements = ParseNumeric ( inputDataLines.extractFirst () ) ;
  const dataCollection = inputDataLines.extractFirst ()
    .segmentByDelimiter ( ' ' )
    .transformElements ( ParseNumeric ) ;

  constructBinaryHeap ( dataCollection , totalElements ) ;

  outputChannel.displayMessage (
    dataCollection.aggregateValues ( ( currentSumString , itemValue ) =>
      currentSumString += ` ${itemValue}`
    , '' )
  ) ;
} ) ( ) ;

function constructBinaryHeap ( dataCollection , totalElements )
{
  const heapifyDown = ( currentIndexPosition ) =>
  {
    let leftChildIndex , rightChildIndex , largestElementIndex ;

    leftChildIndex = 2 * currentIndexPosition + 1 ;
    rightChildIndex = 2 * currentIndexPosition + 2 ;

    largestElementIndex = leftChildIndex < totalElements && dataCollection[leftChildIndex] > dataCollection[currentIndexPosition]
      ? leftChildIndex
      : currentIndexPosition ;

    if ( rightChildIndex < totalElements && dataCollection[rightChildIndex] > dataCollection[largestElementIndex] )
    {
      largestElementIndex = rightChildIndex ;
    }

    if ( largestElementIndex !== currentIndexPosition )
    {
      dataCollection[largestElementIndex] = [
        dataCollection[currentIndexPosition] ,
        dataCollection[currentIndexPosition] = dataCollection[largestElementIndex]
      ] [ 0 ] ;
      heapifyDown ( largestElementIndex ) ;
    }
  } ;

  for ( let currentIndexPosition = totalElements << 1 ; currentIndexPosition >= 0 ; currentIndexPosition-- )
  {
    heapifyDown ( currentIndexPosition ) ;
  }
}