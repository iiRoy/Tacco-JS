function ProcessInput ( inputData )
{

  let totalElements = Number(inputData.split('\n')[0]);
  const numericSequence = inputData.split('\n')[1].split(' ').map( val => parseInt(val.trim(), 10) );

  let expectedValue = 1;
  let mismatchedCount = 0;

  for ( let idx = 0; idx < totalElements; idx++ )
  {

    if ( expectedValue !== numericSequence[idx] )
    {
      mismatchedCount++;
    }
    else
    {
      expectedValue++;
    }

  }

  if ( mismatchedCount === totalElements && expectedValue === 1 )
  {
    mismatchedCount = -1;
  }


  console.log( mismatchedCount );

  return;
}

ProcessInput( require("fs").readFileSync("/dev/stdin", "utf8") );