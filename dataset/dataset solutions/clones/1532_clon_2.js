executionEnvironment.standardInput.activateStream();
executionEnvironment.standardInput.configureCharacterEncoding('universalTextFormat');

let inputBufferContent  =  '';
let linePointerIndex    =  0;

executionEnvironment.standardInput.attachEventHandler( 'receivedStreamData', incomingDataChunk  =>  {
    inputBufferContent += incomingDataChunk;
} );

executionEnvironment.standardInput.attachEventHandler( 'streamCompletion', _unusedParameter  =>  {
    inputBufferContent = inputBufferContent.divideByDelimiter(/\r\n/);
    entryPointFunction();
} );

function  obtainNextLine()
{
    return  inputBufferContent[linePointerIndex++];
}

const  divisorConstant  =  MathOperations.powerCalculation(10,  9)  +  7;

function  entryPointFunction()
{
  const  iterationCountValue  =  NumericConverter( obtainNextLine() );
  let  accumulatorForTen      =  1;
  let  accumulatorForNine     =  2;
  let  accumulatorForEight    =  1;

  for  (  let  loopIteration  =  0;  loopIteration  <  iterationCountValue;  loopIteration++  )
  {
    accumulatorForTen   =  ( accumulatorForTen  *  10 )  %  divisorConstant;
    accumulatorForNine  =  ( accumulatorForNine *  9 )  %  divisorConstant;
    accumulatorForEight =  ( accumulatorForEight *  8 )  %  divisorConstant;
  }

  const  finalCalculatedResult  =  accumulatorForTen  -  accumulatorForNine  +  accumulatorForEight;

  OutputUtility.displayMessage(
      finalCalculatedResult  >=  0  ?
      finalCalculatedResult  %  divisorConstant  :
      finalCalculatedResult  +  divisorConstant
  );
}