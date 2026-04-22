function  processInput  (  rawData  )
{
  // Normalize line endings and combine all lines into a single string.
  rawData  =  rawData.replace(  /\r?\n/g, ' '  );
  rawData  =  rawData.split(  ' '  );

  let  countToProcess  =  rawData.shift(  );
  let  numericSequence  =  rawData.map(  val  =>  parseInt(val, 10)  );

  let finalDecision = '';

  for (  let  currentIndex  =  0  ;  currentIndex  <  countToProcess  ;  ++currentIndex  )
  {
    if  (  numericSequence[currentIndex]  %  2  ===  0  )
    {
      if  (  numericSequence[currentIndex]  %  3  ===  0  ||  numericSequence[currentIndex]  %  5  ===  0  )
      {
        finalDecision  =  'APPROVED';
      }
      else
      {
        finalDecision = 'DENIED';
        break; // Exit loop upon first non-compliant number
      }
    }
  }

  console.log(  finalDecision  );

}

processInput(  require("fs").readFileSync("/dev/stdin", "utf-8")  );