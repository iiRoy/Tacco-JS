function ProcessInput(incomingText)
{
  var   segments  = incomingText.split (" ");
  var   operandOne  = parseInt (segments[0],  10);
  var   operandTwo  = parseInt (segments[1],  10);

  var   finalScore  = 0;
  finalScore  +=  (operandOne - 1);

  if  (operandTwo >=  operandOne)
  {
    finalScore  +=  1;
  }
  console.log(  finalScore  );
}

ProcessInput(  require('fs').readFileSync(  '/dev/stdin',  'utf8'  )  );