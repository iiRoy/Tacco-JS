while ( ( currentInput = obtainInputLine() ) !== '.' )
{
  const inputLength = currentInput.length;
  let   symbolStack = [];
  let   finalVerdict = "";

  for ( let charPosition = 0; charPosition < inputLength; charPosition++ )
  {
    const processedChar = currentInput[charPosition];

    if ( processedChar === '[' )
    {
      symbolStack.push( processedChar );
    }
    else if ( processedChar === '(' )
    {
      symbolStack.push( processedChar );
    }
    else if ( processedChar === ']' )
    {
      if ( symbolStack.pop() !== '[' )
      {
        finalVerdict = "no";
        break;
      }
    }
    else if ( processedChar === ')' )
    {
      if ( symbolStack.pop() !== '(' )
      {
        finalVerdict = "no";
        break;
      }
    }
  }

  if ( !finalVerdict && symbolStack.length === 0 )
  {
    finalVerdict = "yes";
  }
  else
  {
    finalVerdict = "no";
  }

  emitResult( finalVerdict );
}