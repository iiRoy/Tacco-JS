function ProcessData (  rawDataString  )
{
  rawDataString = rawDataString . split ( "\n" );
  var totalElements = parseInt ( rawDataString[0].split(" ")[0] );
  var initialValues = rawDataString[1] . split ( " " );
  var numericArray = new Array ( totalElements ) . fill ( 0 );
  var operationRecords = new Array ( );
  for ( var idx = 0 ; idx < totalElements ; idx++ )
  {
    numericArray[idx] = parseInt ( initialValues[idx] );
    if ( idx > 0 && numericArray[idx] < numericArray[idx-1] && numericArray[idx] > 0 )
    {
      var currentOperation = [idx-1, idx];
      operationRecords . push ( currentOperation );
      numericArray[idx] = numericArray[idx-1] + numericArray[idx];
    }
    else if ( idx > 0 && numericArray[idx] < 0 && numericArray[idx] < numericArray[idx-1] )
    {
      var currentOperation = [idx-1, idx];
      for ( var loopCounter = 0 ; numericArray[idx] + numericArray[idx-1]*(loopCounter) <= numericArray[idx-1] ; idx++ )
      {
        operationRecords . push ( currentOperation );
        numericArray[idx] += numericArray[idx-1];
      }
      operationRecords . push ( currentOperation );
      numericArray[idx] += numericArray[idx-1];
    }
  }
  var resultOutput = operationRecords . length ;
  for ( var idx = 0 ; idx < operationRecords . length ; idx++ )
  {
    resultOutput += "\n" + operationRecords[idx][0] + " " + operationRecords[idx][1];
  }
  console . log ( '%s', resultOutput );
}
ProcessData ( require ( "fs" ) . readFileSync ( "/dev/stdin", "utf8" ) );